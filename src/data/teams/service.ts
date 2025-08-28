"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { TeamModel } from "./model";
import { TeamCreateIn, TeamGroupNameOut, TeamOut, TeamUpdateIn } from "./dto";
import { toTeamGroupNameOut, toTeamOut } from "./serializer";
import { safeParseForm, zObjectId, ActionResult } from "@/data/_helpers";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";
import { getConn } from "@/lib/db";

/* ════════════════  C R E A T E  ════════════════ */

export async function createTeam(
  tid: string, // TODO: Replace with slugs later.
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("teams.create.start", { tid });

  const tidOk = zObjectId.safeParse(tid);
  if (!tidOk.success) {
    logger.warn("teams.create.invalid_tournamentId", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, TeamCreateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("teams.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      // values: stickyValuesHere,  // e.g. Object.fromEntries(formData)
    };
  }

  try {
    await getConn();

    const doc = await time("db.teams.create", () =>
      TeamModel.create(validated.data)
    );

    logger.info("teams.create.ok", {
      id: String(doc._id),
      tournamentId: String(doc.tournamentId),
    });
  } catch (error) {
    logger.error("teams.create.fail", error);
    return { ok: false, message: "Database Error: Failed to create team." };
  }

  revalidatePath(`/tournament/${tid}/teams`); // adjust path to your routes
  redirect(`/tournament/${tid}/teams`);
}

/* ════════════════  R E A D  ════════════════ */

export async function getTeam(teamId: string): Promise<TeamOut | null> {
  logger.debug("teams.get.start", { teamId });
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("teams.get.invalid_id", { teamId });
    // throw new AppError("BAD_REQUEST", "Invalid team id");
    throw new Error("Invalid team id");
  }
  let row;
  try {
    await getConn();
    row = await time("db.teams.findById", () =>
      TeamModel.findById(id.data).lean().exec()
    );
  } catch (error) {
    logger.error("teams.get.db_conn", error);
    throw new Error("Database Error: Failed to fetch team.");
  }
  logger.debug("teams.get.ok", { teamId });
  return row ? toTeamOut(row) : null;
}

export async function listTeams(
  tournamentId: string,
  limit = 100
): Promise<TeamOut[] | null> {
  logger.debug("teams.list.byTournament.start", { tournamentId });
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("teams.list.byTournament.invalid_id", { tournamentId });
    throw new Error("Invalid tournament id");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.teams.findByTournament", () =>
      TeamModel.find({ tournamentId: id.data }).limit(limit).lean().exec()
    );
  } catch (error) {
    logger.error("teams.list.byTournament.db_conn", { error });
    throw new Error("Database Error: Failed to fetch teams.");
  }

  logger.debug("teams.list.byTournament.ok", { tournamentId });
  return rows ? rows.map(toTeamOut) : null;
}

export async function listTeamsWithGroupName(
  tournamentId: string
): Promise<TeamGroupNameOut[] | null> {
  logger.debug("list.teams.hydrate.groupName.start", { tournamentId });
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("list.teams.hydrate.groupName.invalid_id", {
      tournamentId,
    });
    throw new Error("Invalid tournament id");
  }

  let rows;
  try {
    // 2) Connect
    await getConn();

    // 3) Query (timed)
    rows = await time("db.teams.aggregateWithGroup", () =>
      TeamModel.aggregate<TeamGroupNameOut>([
        // Soft delete: mirror your "notDeleted" logic from .find()
        // Prefer using deletedAt to match the rest of your codebase:
        {
          $match: {
            tournamentId: id.data,
            deletedAt: { $in: [null, undefined] },
          },
        },
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
      ]).exec()
    );

    // 4) Return normalized payload
  } catch (error) {
    logger.error("list.teams.hydrate.groupName.db_conn", {
      error,
      tournamentId: String(id.data),
    });
    throw new Error("Database Error: Failed to fetch teams.");
  }
  logger.debug("list.teams.hydrate.groupName.ok", { tournamentId });
  return rows ? rows.map(toTeamGroupNameOut) : null;
}

/* ════════════════  U P D A T E  ════════════════ */
// TODO: Add teamId as a param.
export async function updateTeam(
  tid: string, // TODO: Replace with slug
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("teams.update.start", { tid });

  const tidOk = zObjectId.safeParse(tid);
  if (!tidOk.success) {
    logger.warn("teams.update.invalid_id", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, TeamUpdateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("teams.update.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      // values: stickyValuesHere,  // e.g. Object.fromEntries(formData)
    };
  }

  const { _id, ...patch } = validated.data;
  if (!_id) {
    logger.warn("teams.update.missing_id");
    return { ok: false, message: "Missing team id." };
  }

  try {
    await getConn();

    const updated = await time("db.teams.updateById", () =>
      TeamModel.findByIdAndUpdate(_id, patch, {
        runValidators: true,
        new: false,
      }).exec()
    );

    if (!updated) {
      logger.warn("teams.update.not_found", { id: _id });
      return { ok: false, message: "Team not found." };
    }

    logger.info("teams.update.ok", { id: String(_id) });
  } catch (error) {
    logger.error("teams.update.fail", error);
    return { ok: false, message: "Database Error: Failed to update team." };
  }

  revalidatePath(`/tournament/${tid}/teams/${_id}`);
  redirect(`/tournament/${tid}/teams/${_id}`);
}
/* ════════════════  D E L E T E  (soft) ════════════════ */

export async function softDeleteTeam(
  tid: string,
  teamId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("listTeams.tournamentId", { teamId });
    throw new Error("Invalid tournament id");
  }

  try {
    await getConn();

    const team = await time("db.teams.getForDelete", () =>
      TeamModel.findById(id.data).exec()
    );

    if (!team) {
      logger.warn("teams.delete.not_found", { id });
      return { ok: false, message: "Team not found." };
    }

    await time("db.teams.softDelete", () =>
      (team as any).softDelete?.(by, reason)
    );

    logger.info("teams.delete.ok", { id, by, reason });
  } catch (error) {
    logger.error("teams.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to delete team." };
  }

  revalidatePath(`/tournament/${tid}/teams`);
  return { ok: true };
}

export async function restoreTeam(
  tid: string,
  teamId: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("listTeams.tournamentId", { teamId });
    throw new Error("Invalid tournament id");
  }
  try {
    await getConn();
    const team = await time("db.teams.getForRestore", () =>
      TeamModel.findById(id.data).exec()
    );
    if (!team) {
      logger.warn("teams.restore.not_found", { teamId });
      return { ok: false, message: "Team not found." };
    }

    await time("db.teams.restore", () => (team as any).restore());
    logger.info("teams.restore.ok", { teamId });
  } catch (error) {
    logger.error("teams.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to restore team." };
  }
  revalidatePath(`/tournament/${tid}/teams`);
  return { ok: true };
}
