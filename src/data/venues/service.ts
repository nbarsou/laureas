// data/venues/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VenueSchema, VenueModel, type Venue } from "@/data/venues/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";

/** ---------- Types ---------- */
const WriteVenue = VenueSchema.omit({ _id: true });

export type State = {
  errors?: {
    tournamentId?: string[];
    name?: string[];
    address?: string[];
    surface_type?: string[];
  };
  message?: string | null;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; errors?: State["errors"] };

export type VenueLean = Omit<Venue, "_id"> & { _id: string };

/** ---------- CREATE ---------- */
export async function createVenue(
  prev: ActionResult,
  form: FormData
): Promise<ActionResult> {
  const parsed = WriteVenue.safeParse({
    tournamentId: form.get("tournamentId"),
    name: form.get("name"),
    address: form.get("address"),
    surface_type: form.get("surface_type") || "other",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing fields. Failed to create venue.",
    };
  }

  try {
    await getConn();
    await VenueModel.create(parsed.data);
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to create venue." };
  }

  revalidatePath(`/tournament/${parsed.data.tournamentId}/venues`);
  redirect(`/tournament/${parsed.data.tournamentId}/venues`);
}

/** ---------- READ (list) ---------- */
export async function fetchVenues(): Promise<Venue[]> {
  await getConn();
  return await VenueModel.find().sort({ name: 1 }).lean<Venue[]>();
}

export async function fetchVenuesByTournamentId(
  tournamentId: string
): Promise<Venue[]> {
  await getConn();

  const tid = zObjectId.parse(tournamentId);

  return await VenueModel.find({ tournamenId: tid })
    .sort({ name: 1 })
    .lean<Venue[]>();
}
/** ---------- READ (by id) ---------- */
export async function fetchVenueById(id: string): Promise<Venue | null> {
  zObjectId.parse(id);
  await getConn();
  return await VenueModel.findById(id).lean<Venue>();
}

/** ---------- UPDATE ---------- */
export async function updateVenue(
  id: string,
  prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  const parsed = WriteVenue.safeParse({
    tournamentId: formData.get("tournamentId"),
    name: formData.get("name"),
    address: formData.get("address"),
    surface_type: formData.get("surface_type") || "other",
  });

  if (!parsed.success) {
    console.log(parsed);
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Missing/invalid fields. Failed to update venue.",
    };
  }

  try {
    await getConn();
    await VenueModel.findByIdAndUpdate(idCheck.data, parsed.data, {
      runValidators: true,
      new: false,
    });
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to update venue." };
  }

  revalidatePath(`/tournament/${parsed.data.tournamentId}/venues`);
  redirect(`/tournament/${parsed.data.tournamentId}/venues`);
}

/** ---------- DELETE ---------- */
export async function deleteVenue(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  try {
    await getConn();
    await VenueModel.findByIdAndDelete(idCheck.data);
  } catch (e: any) {
    logger.error(e);
    return { ok: false, message: "Database Error: Failed to delete venue." };
  }

  revalidatePath("/tournament/venues");
  return { ok: true };
}
