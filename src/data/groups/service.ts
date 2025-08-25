// src/data/groups/service.ts
"use server";

import { getConn } from "@/lib/db";
import { ActionResult } from "../_helpers";
import { Group, GroupCreate, GroupDb, GroupModel, GroupUpdate } from "./schema";
import { logger } from "@/lib/logging";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helpers
export function toGroupOut(doc: GroupDb): Group {
  return {
    _id: String(doc._id),
    tournamentId: String(doc.tournamentId),
    name: doc.name,
    slug: doc.slug ?? undefined,
  };
}

// ============ Create ===========
export async function createGroup(
  tid: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  // Implement your group creation logic here
  const payload = {
    tournamentId: tid,
    name: form.get("name")?.toString(),
    slug: form.get("slug")?.toString(),
  };
  const parsed = GroupCreate.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await getConn();
    await GroupModel.create(parsed.data);
  } catch (err: Error | any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Create Group." };
  }

  revalidatePath(`/tournaments/${tid}/groups`); // TODO: Adjust later
  redirect(`/tournaments/${tid}/groups`);
}

// ============ READ ===========
export async function listGroups(tid: string): Promise<Group[]> {
  try {
    await getConn();
    const groups = await GroupModel.find({ tournamentId: tid });
    return groups.map(toGroupOut);
  } catch (err: Error | any) {
    logger.error(err);
    return [];
  }
}

export async function getGroup(id: string): Promise<Group | null> {
  try {
    await getConn();
    const group = await GroupModel.findById(id);
    return group ? toGroupOut(group) : null;
  } catch (err: Error | any) {
    logger.error(err);
    return null;
  }
}

// =========== UPDATE ===========
export async function updateGroup(
  prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const parsed = GroupUpdate.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { _id, ...update } = parsed.data;

  try {
    await getConn();
    const prev = await GroupModel.findByIdAndUpdate(_id, update, {
      new: true,
      runValidators: true,
    });
    if (!prev) {
      return { ok: false, message: "Group not found." };
    }
  } catch (err: Error | any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Update Group." };
  }

  revalidatePath(`/tournaments/${parsed.data.tournamentId}/groups`); // TODO: Adjust later
  redirect(`/tournaments/${parsed.data.tournamentId}/groups`);
}

// =========== DELETE ===========
export async function deleteGroup(
  id: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await getConn();
    const group = await GroupModel.findById(id);
    if (!group) {
      return { ok: false, message: "Group not found." };
    }
    await (group as any).softDelete?.(by, reason); // instance method from plugin
  } catch (err: Error | any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Delete Group." };
  }

  // revalidatePath(`/tournaments/${group.tournamentId}/groups`); // TODO: Adjust later
  return { ok: true };
  // redirect(`/tournaments/${group.tournamentId}/groups`);
}
