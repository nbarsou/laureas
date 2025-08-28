"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { TeamModel } from "./model";
import { TeamCreateIn, TeamUpdateIn } from "./dto";
import { toTeamOut } from "./serializer";
import { zObjectId } from "@/data/_helpers";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";
import { getConn } from "@/lib/db";
import type { ActionResult } from "@/data/_helpers"; // if you have it there

const notDeleted = { deletedAt: { $in: [null, undefined] } };

/** Generic FormData → plain object (handles repeated keys → arrays) */
function formDataToObject(fd: FormData): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of fd.entries()) {
    if (k in out) {
      const cur = out[k];
      out[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** One-liner: parse any FormData with a Zod schema (no manual field picking) */
function safeParseForm<T>(fd: FormData, schema: z.ZodSchema<T>) {
  const raw = formDataToObject(fd);
  return schema.safeParse(raw);
}

/* ════════════════  C R E A T E  ════════════════ */

/** Server Action (FormData path) */
export async function createTeam(
  tid: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.info("teams.create.start", {
    tid: String(formData.get("tournamentId") ?? ""),
  });

  const validated = safeParseForm(formData, TeamCreateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("teams.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      // values: stickyValuesHere,  // e.g. Object.fromEntries(formData)
    } satisfies ActionResult;
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

export async function getTeam(teamId: string) {
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("listTeams.invalidTeamId", { teamId });
    // throw new AppError("BAD_REQUEST", "Invalid team id");
    throw new Error("Invalid team id");
  }
  let row;
  try {
    await getConn();
    row = await time("db.teams.findById", () =>
      TeamModel.findOne({ _id: id.data }).lean().exec()
    );
  } catch (error) {
    logger.error("getTeam.db_connection", error);
    throw new Error("Database Error: Failed to fetch team.");
  }
  return row ? toTeamOut(row) : null;
}

export async function listTeams(tournamentId: string, limit = 100) {
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("listTeams.tournamentId", { tournamentId });
    throw new Error("Invalid tournament id");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.teams.findAll", () =>
      TeamModel.find({ tournamentId: id.data }).limit(limit).exec()
    );
  } catch (error) {
    logger.error("listTeams.db_connection", { error });
    throw new Error("Database Error: Failed to fetch teams.");
  }

  return rows.map(toTeamOut);
}

/* ════════════════  U P D A T E  ════════════════ */

/** Server Action (FormData path) */
export async function updateTeam(
  tid: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const validated = safeParseForm(formData, TeamUpdateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("teams.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      // values: stickyValuesHere,  // e.g. Object.fromEntries(formData)
    } satisfies ActionResult;
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
      })
        .select("tournamentId")
        .exec()
    );

    if (!updated) {
      logger.warn("teams.update.not_found", { id: _id });
      return { ok: false, message: "Team not found." };
    }

    logger.info("teams.update.ok", { id: _id });
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
      TeamModel.findById({ _id: id }).exec()
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
    await time("db.teams.restore", () =>
      TeamModel.updateOne({ _id: id }).exec()
    );
    logger.info("teams.restore.ok", { id });
  } catch (error) {
    logger.error("teams.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to restore team." };
  }
  revalidatePath(`/tournament/${tid}/teams`);
  return { ok: true };
}
