// data/timeslots/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TimeslotSchema,
  TimeslotModel,
  type Timeslot,
} from "@/data/timeslots/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { ActionResult, zObjectId } from "@/data/_helpers";

/** ---------- Types ---------- */
const WriteTimeslot = TimeslotSchema.omit({ _id: true });

export type TimeslotState = {
  errors?: {
    venue_id?: string[];
    day_of_week?: string[];
    start_time?: string[];
    end_time?: string[];
    timezone?: string[];
    is_active?: string[];
    label?: string[];
  };
  message?: string | null;
};

export type TimeslotLean = Omit<Timeslot, "_id" | "venue_id"> & {
  _id: string;
  venue_id: string;
};

/** ---------- CREATE ---------- */
export async function createTimeslot(
  prev: TimeslotState,
  form: FormData
): Promise<ActionResult> {
  const parsed = WriteTimeslot.safeParse({
    venue_id: form.get("venue_id"),
    day_of_week: Number(form.get("day_of_week")),
    start_time: form.get("start_time"),
    end_time: form.get("end_time"),
    timezone: form.get("timezone") || "America/Mexico_City",
    is_active: String(form.get("is_active") ?? "true") === "true",
    label: form.get("label") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing/invalid fields. Failed to create timeslot.",
    };
  }

  try {
    await getConn();
    await TimeslotModel.create(parsed.data);
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to create timeslot." };
  }

  revalidatePath("/dashboard/timeslots");
  redirect("/dashboard/timeslots");
}

/** ---------- READ (list all active, optional by venue) ---------- */
export async function fetchTimeslots(params?: {
  venueId?: string;
  includeInactive?: boolean;
}): Promise<Timeslot[]> {
  await getConn();

  const filter: Record<string, unknown> = {};
  if (params?.venueId) {
    zObjectId.parse(params.venueId);
    filter.venue_id = params.venueId;
  }
  if (!params?.includeInactive) {
    filter.is_active = true;
  }

  return await TimeslotModel.find(filter)
    .sort({ day_of_week: 1, start_time: 1 })
    .lean<Timeslot[]>();
}

/** ---------- READ (by id) ---------- */
export async function fetchTimeslotById(id: string): Promise<Timeslot | null> {
  zObjectId.parse(id);
  await getConn();
  return await TimeslotModel.findById(id).lean<Timeslot>();
}

/** ---------- UPDATE ---------- */
export async function updateTimeslot(
  id: string,
  prev: TimeslotState,
  form: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  const parsed = WriteTimeslot.safeParse({
    venue_id: form.get("venue_id"),
    day_of_week: Number(form.get("day_of_week")),
    start_time: form.get("start_time"),
    end_time: form.get("end_time"),
    timezone: form.get("timezone") || "America/Mexico_City",
    is_active: String(form.get("is_active") ?? "true") === "true",
    label: form.get("label") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing/invalid fields. Failed to update timeslot.",
    };
  }

  try {
    await getConn();
    await TimeslotModel.findByIdAndUpdate(idCheck.data, parsed.data, {
      runValidators: true,
      new: false,
    });
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to update timeslot." };
  }

  revalidatePath("/dashboard/timeslots");
  redirect("/dashboard/timeslots");
}

/** ---------- PARTIAL UPDATE: toggle is_active ---------- */
export async function toggleTimeslotActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  try {
    await getConn();
    await TimeslotModel.findByIdAndUpdate(
      idCheck.data,
      { is_active: !!active },
      { runValidators: true }
    );
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to toggle timeslot." };
  }

  revalidatePath("/dashboard/timeslots");
  return { ok: true };
}

/** ---------- DELETE ---------- */
export async function deleteTimeslot(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  try {
    await getConn();
    await TimeslotModel.findByIdAndDelete(idCheck.data);
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to delete timeslot." };
  }

  revalidatePath("/dashboard/timeslots");
  return { ok: true };
}
