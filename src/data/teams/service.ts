// src/data/teams/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types, type HydratedDocument } from "mongoose";
import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { zObjectId, type ActionResult } from "@/data/_helpers";
import { TeamModel, TeamCreate, TeamUpdate, Team, TeamDb } from "./schema";

/* ───────── Helpers ───────── */

const toTeamOut = (d: Team): Team => ({
  _id: String(d._id),
  tournamentId: String(d.tournamentId),
  ...(d.groupId ? { groupId: String(d.groupId) } : {}),
  name: d.name,
  manager: d.manager,
});

/* Optional hydrated fetch when you need doc methods/virtuals */
export async function getTeamDoc(
  id: string
): Promise<HydratedDocument<TeamDb> | null> {
  await getConn();
  return TeamModel.findById(id); // non-lean
}

/* ════════════════  C R E A T E  ════════════════
   Bind tournamentId from the page: action={createTeam.bind(null, tid)} */
export async function createTeam(
  tournamentId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const payload = {
    tournamentId,
    name: String(form.get("name") ?? ""),
    manager: String(form.get("manager") ?? ""),
    // groupId optional: String(form.get("groupId") ?? "") if you include it
  };

  const parsed = TeamCreate.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await getConn();
    await TeamModel.create(parsed.data);
  } catch (err: any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Create Team." };
  }

  revalidatePath(`/tournament/${tournamentId}/teams`);
  redirect(`/tournament/${tournamentId}/teams`);
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllTeams(): Promise<Team[]> {
  await getConn();
  const rows = await TeamModel.find(
    {},
    { _id: 1, tournamentId: 1, groupId: 1, name: 1, manager: 1 }
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  const out = (rows as any[]).map((r) => ({
    _id: String(r._id),
    tournamentId: String(r.tournamentId),
    ...(r.groupId ? { groupId: String(r.groupId) } : {}),
    name: String(r.name),
    manager: String(r.manager),
  })) as Team[];

  return out;
}

export async function fetchTeamsByTournamentId(
  tournamentId: string
): Promise<Team[]> {
  await getConn();
  zObjectId.parse(tournamentId);

  const rows = await TeamModel.find(
    { tournamentId },
    { _id: 1, tournamentId: 1, groupId: 1, name: 1, manager: 1 }
  )
    .sort({ name: 1 })
    .lean()
    .exec();

  const out = (rows as any[]).map((r) => ({
    _id: String(r._id),
    tournamentId: String(r.tournamentId),
    ...(r.groupId ? { groupId: String(r.groupId) } : {}),
    name: String(r.name),
    manager: String(r.manager),
  })) as Team[];

  return out;
}

export async function fetchTeamById(id: string): Promise<Team | null> {
  await getConn();
  zObjectId.parse(id);
  const row = (await TeamModel.findById(id).lean().exec()) as Team | null;
  return row ? toTeamOut(row) : null;
}

/* If you want the joined group name in one call (string ids already) */
export type TeamWithGroup = Team & { groupName: string | null };

export async function fetchTeamsWithGroupName(
  tournamentId: string
): Promise<TeamWithGroup[]> {
  await getConn();
  const tid = new Types.ObjectId(zObjectId.parse(tournamentId));

  // Note: soft-delete plugin does not affect aggregation; include isDeleted filter manually.
  const rows = await TeamModel.aggregate<TeamWithGroup>([
    { $match: { tournamentId: tid, isDeleted: { $ne: true } } },
    {
      $lookup: {
        from: "groups",
        localField: "groupId",
        foreignField: "_id",
        as: "grp",
        pipeline: [{ $project: { _id: 1, name: 1 } }],
      },
    },
    { $unwind: { path: "$grp", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: { $toString: "$_id" },
        tournamentId: { $toString: "$tournamentId" },
        groupId: {
          $cond: [
            { $ifNull: ["$groupId", false] },
            { $toString: "$groupId" },
            "$$REMOVE",
          ],
        },
        name: 1,
        manager: 1,
        groupName: { $ifNull: ["$grp.name", null] },
      },
    },
    { $sort: { name: 1 } },
  ]).exec();

  return rows;
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateTeam(
  tid: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(form);
  const parsed = TeamUpdate.safeParse(raw);
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
    const prev = await TeamModel.findByIdAndUpdate(_id, update, {
      runValidators: true,
      new: false,
    })
      .select("tournamentId")
      .lean()
      .exec();
    if (!prev) return { ok: false, message: "Team not found." };
    if (!tid && prev?.tournamentId) tid = String(prev.tournamentId);
  } catch (err: any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Update Team." };
  }

  if (tid) {
    revalidatePath(`/tournament/${tid}/teams`);
    redirect(`/tournament/${tid}/teams`);
  } else {
    revalidatePath(`/tournament`);
    redirect(`/tournament`);
  }
}

/* ════════════════  D E L E T E (soft)  ════════════════
   Atomic update + return the original for revalidate path. */
export async function deleteTeam(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  try {
    await getConn();
    const prev = await TeamModel.findOneAndUpdate(
      { _id: idCheck.data }, // not deleted yet, no withDeleted needed
      {
        $set: { isDeleted: true, deletedAt: new Date() },
      },
      { new: false, projection: { tournamentId: 1 } }
    ).lean();
    if (!prev) return { ok: false, message: "Team not found." };

    const tid = String((prev as any).tournamentId);
    revalidatePath(`/tournament/${tid}/teams`);
    return { ok: true };
  } catch (err: any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Delete Team." };
  }
}

/* ════════════════  R E S T O R E (soft)  ════════════════
   Include the withDeleted marker so plugin bypasses the filter. */
export async function restoreTeam(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success) return { ok: false, message: "Invalid id." };

  try {
    await getConn();
    const prev = await TeamModel.findOneAndUpdate(
      { _id: idCheck.data, withDeleted: true }, // marker recognized by your plugin
      {
        $set: { isDeleted: false },
        $unset: { deletedAt: 1, deletedBy: 1, deleteReason: 1 },
      },
      { new: false, projection: { tournamentId: 1 } }
    ).lean();
    if (!prev) return { ok: false, message: "Team not found." };

    const tid = String((prev as any).tournamentId);
    revalidatePath(`/tournament/${tid}/teams`);
    return { ok: true };
  } catch (err: any) {
    logger.error(err);
    return { ok: false, message: "Database Error: Failed to Restore Team." };
  }
}
