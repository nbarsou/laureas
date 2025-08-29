// data/venues/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { VenueModel } from "./model";
import { VenueCreateIn, VenueUpdateIn, VenueOut } from "@/data/venues/dto";
import { toVenueOut } from "./serializers";

import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { ActionResult, safeParseForm, zObjectId } from "@/data/_helpers";
import { time } from "@/lib/logging/timing";

/** ---------- CREATE ---------- */
export async function createVenue(
  tid: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("venues.create.start", { tid });
  const id = zObjectId.safeParse(tid);
  if (!id.success) {
    logger.warn("venues.create.invalid_tournamentId", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  formData.set("tournamentId", id.data);

  const validated = safeParseForm(formData, VenueCreateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("venues.create.validation_failed", { fieldErrors });
    return { ok: false, message: "Validation failed.", errors: fieldErrors };
  }

  try {
    await getConn();
    const doc = await time("db.venues.create", () =>
      VenueModel.create(validated.data)
    );
    logger.info("venues.create.success", { id: doc._id });
  } catch (error: any) {
    logger.error("venues.create.error", error);
    return { ok: false, message: "Database Error: Failed to create venue." };
  }

  revalidatePath(`/tournament/${tid}/venues`);
  redirect(`/tournament/${tid}/venues`);
}

/** ---------- READ (list) ---------- */
export async function getVenue(venueId: string): Promise<VenueOut | null> {
  logger.debug("venues.get.start", { venueId });
  const id = zObjectId.safeParse(venueId);
  if (!id.success) {
    logger.warn("venues.get.invalid_id", { venueId });
    throw new Error("Invalid venue id.");
  }
  let row;
  try {
    await getConn();
    row = await time("db.venues.findById", () =>
      VenueModel.findById(id.data).lean<VenueOut>()
    );
  } catch (error) {
    logger.error("venues.get.error", error);
    throw new Error("Database Error: Failed to fetch venue.");
  }
  logger.debug("venues.get.success", { venueId });
  return row ? toVenueOut(row) : null;
}

export async function listVenues(
  tournamentId: string,
  limit = 100
): Promise<VenueOut[] | null> {
  logger.debug("venues.list.byTournament.start", { tournamentId });
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("venues.list.byTournament.invalid_id", { tournamentId });
    throw new Error("Invalid tournament id.");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.venues.findByTournament", () =>
      VenueModel.find({ tournamentId: id.data }).limit(limit).lean().exec()
    );
  } catch (error) {
    logger.error("venues.list.error", error);
    throw new Error("Database Error: Failed to fetch venues.");
  }
  logger.debug("venues.list.success", { tournamentId });
  return rows ? rows.map(toVenueOut) : null;
}

/** ---------- UPDATE ---------- */
export async function updateVenue(
  venueId: string,
  tournamentId: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("venues.update.start", { venueId });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("teams.update.invalid_id", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  const id = zObjectId.safeParse(venueId);
  if (!id.success) {
    logger.warn("teams.update.invalid_id", { id });
    return { ok: false, message: "Invalid venue id." };
  }

  formData.set("tournamentId", tid.data);
  formData.set("venueId", id.data);

  const validated = safeParseForm(formData, VenueUpdateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("venues.update.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors,
    };
  }

  const { _id, ...patch } = validated.data;

  try {
    await getConn();
    const updated = await time("db.venues.updateById", () =>
      VenueModel.findByIdAndUpdate(_id, patch, {
        runValidators: true,
        new: false,
      }).exec()
    );
    if (!updated) {
      logger.warn("venues.update.not_found", { venueId });
      return { ok: false, message: "Venue not found." };
    }
    logger.info("venues.update.success", { id: updated._id });
  } catch (error) {
    logger.error("venues.update.error", error);
    return { ok: false, message: "Database Error: Failed to update venue." };
  }

  revalidatePath(`/tournament/${tid.data}/venues/${_id}`);
  redirect(`/tournament/${tid.data}/venues/${_id}`);
}

/** ---------- DELETE ---------- */
export async function softDeleteVenue(
  tid: string,
  venueId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(venueId);
  if (!id.success) {
    logger.warn("venues.delete.invalid_id", { venueId });
    throw new Error("Invalid venue id.");
  }

  try {
    await getConn();
    const venue = await time("db.venues.softDelete", () =>
      VenueModel.findByIdAndUpdate(id.data).exec()
    );
    if (!venue) {
      logger.warn("venues.delete.not_found", { venueId });
      return { ok: false, message: "Venue not found." };
    }

    await time("db.venues.softDelete", () =>
      (venue as any).softDelete()?.(by, reason)
    );
    logger.info("venues.delete.success", { id: venue._id });
  } catch (error) {
    logger.error("venues.delete.error", error);
    return { ok: false, message: "Database Error: Failed to delete venue." };
  }

  revalidatePath(`/tournament/${tid}/venues`);
  return { ok: true };
}

export async function restoreVenue(
  tid: string,
  venueId: string
): Promise<ActionResult> {
  logger.debug("venues.restore.start", { venueId });

  const id = zObjectId.safeParse(venueId);
  if (!id.success) {
    logger.warn("venues.restore.invalid_id", { venueId });
    throw new Error("Invalid venue id.");
  }

  try {
    await getConn();

    const venue = await time("db.venues.getForRestore", () =>
      VenueModel.findById(id.data).exec()
    );

    if (!venue) {
      logger.warn("venues.restore.not_found", { venueId });
      return { ok: false, message: "Venue not found." };
    }

    await time("db.venues.restore", () => (venue as any).restore());
    logger.info("venues.restore.ok", { venueId });
  } catch (error) {
    logger.error("venues.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to restore venue." };
  }

  revalidatePath(`/tournament/${tid}/venues`);
  return { ok: true };
}
