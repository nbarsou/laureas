// data/timeslots/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { TimeslotModel } from "./model";
import {
  TimeslotCreateIn,
  TimeslotUpdateIn,
  TimeslotOut,
  // TimeslotHydratedOut,
} from "./dto";

import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";

import {
  ActionResult,
  formDataToObject,
  safeParseForm,
  zObjectId,
} from "@/data/_helpers";
import { toTimeslotOut } from "./serializer";
import { id } from "zod/locales";

/** ---------- CREATE ---------- */
export async function createTimeslot(
  tid: string,
  venue_id: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("timeslots.create.start", { venue_id });

  const id = zObjectId.safeParse(venue_id);
  if (!id.success) {
    logger.warn("timeslots.create.invalid_venueId", { venue_id });
    return { ok: false, message: "Invalid venue id." };
  }

  formData.set("venue_id", id.data);

  const validated = safeParseForm(formData, TimeslotCreateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("timeslots.create.invalid", { fieldErrors });
    return { ok: false, message: "Validation failed.", errors: fieldErrors };
  }

  try {
    await getConn();
    const doc = await time("db.timeslots.create", () =>
      TimeslotModel.create(validated.data)
    );
    logger.info("timeslots.create.ok", { id: String(doc._id), venue_id });
  } catch (error: any) {
    logger.error("timeslots.create.fail", error);
    return { ok: false, message: "Database Error: Failed to Create Timeslot." };
  }

  revalidatePath(`/tournament/${tid}/venues`);
  redirect(`/tournament/${tid}/venues`);
}

/** ---------- READ  ---------- */
export async function getTimeslot(
  timeslotId: string
): Promise<TimeslotOut | null> {
  logger.debug("timeslots.get.start", { timeslotId });
  const id = zObjectId.safeParse(timeslotId);
  if (!id.success) {
    logger.warn("timeslots.get.invalid_id", { timeslotId });
    throw new Error("Invalid timeslot id.");
  }
  let row;
  try {
    await getConn();
    row = await time("db.timeslots.findById", () =>
      TimeslotModel.findById(id.data).lean().exec()
    );
  } catch (error) {
    logger.error("timeslots.get.fail", error);
    throw new Error("Database Error: Failed to get timeslot.");
  }
  return row ? toTimeslotOut(row) : null;
}

export async function listTimeslots(
  venueId?: string,
  limit = 100
): Promise<TimeslotOut[] | null> {
  logger.debug("timeslots.list.byVenue.start", { venueId });
  const id = zObjectId.safeParse(venueId);
  if (!id.success) {
    logger.warn("timeslots.listbyVenue.invalid_venueId", { venueId });
    return null;
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.timeslots.findByVenue", () =>
      TimeslotModel.find({ venue_id: id.data })
        .sort({ day_of_week: 1, start_time: 1 })
        .limit(limit)
        .lean()
    );
  } catch (error) {
    logger.error("timeslots.list.byVenue.fail", error);
    throw new Error("Database Error: Failed to fetch timeslots by venue");
  }
  return rows ? rows.map(toTimeslotOut) : null;
}

/** ---------- UPDATE ---------- */
export async function updateTimeslot(
  tid: string,
  venue_id: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("timeslots.update.start", { venue_id });
  const idCheck = zObjectId.safeParse(venue_id);
  if (!idCheck.success) {
    logger.warn("timeslots.update.invalid_id", { venue_id });
    return { ok: false, message: "Invalid timeslot id" };
  }

  formData.set("venue_id", tid);

  const validated = safeParseForm(formData, TimeslotUpdateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("timeslots.update.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed",
      errors: fieldErrors,
    };
  }

  const { _id, ...patch } = validated.data;
  if (!_id) {
    logger.warn("timeslots.update.missing_id");
    return { ok: false, message: "Missing timeslot id." };
  }

  try {
    await getConn();
    const updated = await time("db.timeslots.updateById", () =>
      TimeslotModel.findByIdAndUpdate(_id, patch, {
        runValidators: true,
        new: false,
      }).exec()
    );
    if (!updated) {
      logger.warn("timeslots.update.not_found", { id: _id });
      return { ok: false, message: "Timeslot not found." };
    }
    logger.info("timeslots.update.ok", { id: String(updated._id), venue_id });
  } catch (error: any) {
    logger.error("timeslot.update.fail", error);
    return { ok: false, message: "Database Error: Failed to update timeslot." };
  }

  revalidatePath(`/tournament/${tid}/venues/${venue_id}`);
  return { ok: true };
}

/* ════════════════  D E L E T E  (soft) ════════════════ */
export async function deleteTimeslot(
  tid: string,
  timeslotId: string,
  venue_id: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  logger.debug("timeslots.delete.start", { timeslotId });

  const id = zObjectId.safeParse(timeslotId);
  if (!id.success) {
    logger.warn("timeslots.delete.invalid_id", { timeslotId });
    return { ok: false, message: "Invalid timeslot id" };
  }

  try {
    await getConn();
    const timeslot = await time("db.timeslot.findById", () =>
      TimeslotModel.findById(id.data).exec()
    );
    if (!timeslot) {
      logger.warn("timeslots.delete.not_found", { id: timeslotId });
      return { ok: false, message: "Timeslot not found." };
    }
    await time("db.timeslots.softDelete", () =>
      (timeslot as any).softDelete(by, reason)
    );
    logger.info("timeslots.delete.ok", { timeslotId });
  } catch (error) {
    logger.error("timeslots.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to delete timeslot." };
  }

  revalidatePath(`/tournament/${tid}/venues/${venue_id}`);
  return { ok: true };
}
