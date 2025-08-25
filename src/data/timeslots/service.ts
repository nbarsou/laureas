// data/timeslots/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TimeslotCreate,
  TimeslotModel,
  TimeslotUpdate,
  type Timeslot,
} from "@/data/timeslots/schema";
import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { ActionResult, zObjectId } from "@/data/_helpers";

/** ---------- CREATE ---------- */
export async function createTimeslot(
  tid: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const parsed = TimeslotCreate.safeParse({
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

  revalidatePath(`/tournament/${tid}/venues/${parsed.data.venue_id}`);
  redirect(`/tournament/${tid}/venues/${parsed.data.venue_id}`);
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
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  const parsed = TimeslotUpdate.safeParse({
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

  // TODO : if modal then just revalidate the path.
  // TODO: Adjust later the routes
  revalidatePath("/tournament/timeslots");
  const noRedirect = String(form.get("no_redirect") ?? "false") === "true";
  if (noRedirect) {
    return { ok: true, message: "Timeslot created." };
  }

  redirect("/tournament");
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
export async function deleteTimeslot(
  id: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await getConn();
    const timeslot = await TimeslotModel.findById(id);
    if (!timeslot) {
      return { ok: false, message: "Timeslot not found." };
    }
    await (timeslot as any).softDelete?.(by, reason); // instance method from plugin
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to delete timeslot." };
  }

  revalidatePath("/dashboard/timeslots");
  return { ok: true };
}
