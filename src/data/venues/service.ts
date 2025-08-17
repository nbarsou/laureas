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

export type VenueState = {
  errors?: { name?: string[]; address?: string[]; surface_type?: string[] };
  message?: string | null;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; errors?: VenueState["errors"] };

export type VenueLean = Omit<Venue, "_id"> & { _id: string };

/** ---------- CREATE ---------- */
export async function createVenue(
  prev: VenueState,
  form: FormData
): Promise<ActionResult> {
  const parsed = WriteVenue.safeParse({
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

  revalidatePath("/dashboard/venues");
  redirect("/dashboard/venues");
}

/** ---------- READ (list) ---------- */
export async function fetchVenues(): Promise<Venue[]> {
  await getConn();
  return await VenueModel.find().sort({ name: 1 }).lean<Venue[]>();
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
  prev: VenueState,
  form: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  const parsed = WriteVenue.safeParse({
    name: form.get("name"),
    address: form.get("address"),
    surface_type: form.get("surface_type") || "other",
  });

  if (!parsed.success) {
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

  revalidatePath("/dashboard/venues");
  redirect("/dashboard/venues");
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

  revalidatePath("/dashboard/venues");
  return { ok: true };
}
