// data/matches/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { MatchModel } from "./model";
import {
  MatchCreateIn,
  MatchUpdateIn,
  MatchOut,
  MatchHydratedOut,
} from "./dto";

import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";

import { ActionResult, safeParseForm, zObjectId } from "@/data/_helpers";
import { toMatchHydratedOut, toMatchOut } from "./serializer";
import { log } from "console";

export async function createMatch(
  tournamentId: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("matches.create.start", { tournamentId });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("matches.create.invalid_tournamentId", { tournamentId });
    return { ok: false, message: "Invalid tournament ID." };
  }

  formData.set("tournamentId", tournamentId);

  const validated = safeParseForm(formData, MatchCreateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("matches.create.invalid_fields", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors,
    };
  }

  try {
    await getConn();
    const doc = await time("db.matches.create", () =>
      MatchModel.create(validated.data)
    );

    logger.info("matches.create.ok", {
      matchId: doc._id,
      tournamentId: doc.tournamentId,
    });
  } catch (error: any) {
    logger.error("matches.create.error", { error });
    return { ok: false, message: "Database Error: Failed to Create Match." };
  }

  revalidatePath(`/tournament/${tid}/schedule`);
  redirect(`/tournament/${tid}/schedule`);
}

/* ════════════════  R E A D  ════════════════ */
export async function getMatch(matchId: string): Promise<MatchOut | null> {
  logger.debug("matches.get.start", { matchId });
  const id = zObjectId.safeParse(matchId);
  if (id.success) {
    logger.warn("matches.get.invalid_id", { matchId });
    throw new Error("Invalid match id.");
  }
  let row;
  try {
    await getConn();
    row = await time("db.matches.findById", () =>
      MatchModel.findById(id).lean().exec()
    );
  } catch (error: any) {
    logger.error("matches.get.db_conn", { error });
    throw new Error("Database Error: Failed to Retrieve Match.");
  }
  logger.debug("matches.get.ok", { matchId });
  return row ? toMatchOut(row) : null;
}

export async function listMatches(
  tournamentId: string,
  limit = 100
): Promise<MatchOut[] | null> {
  logger.debug("matches.list.byTournament.start", { tournamentId });
  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("matches.list.byTournament.invalid_id", { tournamentId });
    throw new Error("Invalid tournament ID.");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.matches.findByTournament", () =>
      MatchModel.find({ tournamentId: tid }).limit(limit).lean().exec()
    );
  } catch (error: any) {
    logger.error("matches.list.byTournament.db_conn", { error });
    throw new Error("Database Error: Failed to Retrieve Matches.");
  }

  logger.debug("matches.list.byTournament.ok", { tournamentId, limit });
  return rows ? rows.map(toMatchOut) : null;
}

export async function listMatchesHydrated(
  tournamentId: string,
  limit = 100
): Promise<MatchHydratedOut[] | null> {
  logger.debug("matches.list.hydrated.start", { tournamentId, limit });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("matches.list.hydrated.invalid_id", { tournamentId });
    throw new Error("Invalid tournament ID.");
  }

  let rows;
  try {
    await getConn();

    rows = await time("db.matches.find.hydrated", () =>
      MatchModel.find({
        tournamentId: tid.data,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
        .sort({ date: 1, start_time: 1, round: 1, leg: 1 })
        .limit(limit)
        .populate({ path: "homeTeamId", select: "_id name" })
        .populate({ path: "awayTeamId", select: "_id name" })
        .populate({ path: "venueId", select: "_id name" })
        .lean()
        .exec()
    );
  } catch (error: any) {
    logger.error("matches.list.hydrated.db_conn", { error });
    throw new Error("Database Error: Failed to Retrieve Matches.");
  }
  logger.debug("matches.list.hydrated.ok", { tournamentId, limit });

  // Normalize for the serializer (expects homeTeam/awayTeam/venue/group fields)
  const hydrated = rows.map((doc: any) =>
    toMatchHydratedOut({
      ...doc,
      homeTeam: doc.homeTeamId, // {_id, name}
      awayTeam: doc.awayTeamId, // {_id, name}
      venue: doc.venueId ?? null, // {_id, name} | null
      group: undefined, // optional; set if you later populate groupId
    })
  );
  return hydrated ? hydrated : null;
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateMatch(
  tid: string,
  matchId: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("matches.update.start", { tid, matchId });

  const idCheck = zObjectId.safeParse(tid);
  if (!idCheck.success) {
    logger.warn("matches.update.invalid_id", { tid });
    throw new Error("Invalid tournament ID.");
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, MatchUpdateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("matches.update.invalid_fields", { fieldErrors });
    return {
      ok: false,
      message: "Validation Failed.",
      errors: fieldErrors,
    };
  }

  const { _id, ...patch } = validated.data;
  if (!_id) {
    logger.warn("matches.update.missing_id");
    return { ok: false, message: "Missing match id." };
  }

  try {
    await getConn();
    const updated = await time("db.matches.update", () =>
      MatchModel.findByIdAndUpdate(idCheck.data, validated.data, {
        runValidators: true,
        new: false,
      }).exec()
    );
    if (!updated) {
      logger.warn("matches.update.not_found", { id: _id });
      return { ok: false, message: "Match not found." };
    }
    logger.info("matches.update.ok", { id: updated._id });
  } catch (error: any) {
    logger.error("matches.update.fail", { error });
    return { ok: false, message: "Database Error: Failed to Update Match." };
  }

  revalidatePath(`/tournament/${tid}/schedule`);
  redirect(`/tournament/${tid}/schedule`);
}

/* ════════════════  D E L E T E (soft) ════════════════ */
export async function deleteMatch(
  tid: string,
  matchId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  logger.debug("matches.delete.start", { matchId });

  const id = zObjectId.safeParse(matchId);
  if (!id.success) {
    logger.warn("matches.delete.invalid_id", { matchId });
    return {
      ok: false,
      message: "Invalid id.",
    };
  }

  try {
    await getConn();
    const match = await time("db.matches.delete", () =>
      MatchModel.findById(id.data)
    );
    if (!match) {
      logger.warn("matches.delete.not_found", { id: id.data });
      return { ok: false, message: "Match not found." };
    }
    await time("db.matches.softDelete", () =>
      (match as any).softDelete(by, reason)
    );
    logger.info("matches.delete.ok", { id: match._id });
  } catch (error: any) {
    logger.error("matches.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to Delete Match" };
  }

  revalidatePath(`/tournament/${tid}/schedule`);
  return { ok: true };
}

export async function restoreMatch(
  tid: string,
  matchId: string
): Promise<ActionResult> {
  logger.debug("matches.restore.start", { matchId });

  const id = zObjectId.safeParse(matchId);
  if (!id.success) {
    logger.warn("matches.restore.invalid_id", { matchId });
    return {
      ok: false,
      message: "Invalid id.",
    };
  }

  try {
    await getConn();
    const match = await time("db.matches.restore", () =>
      MatchModel.findById(id.data)
    );
    if (!match) {
      logger.warn("matches.restore.not_found", { id: id.data });
      return { ok: false, message: "Match not found." };
    }
    await time("db.matches.restore", () => (match as any).restore());
    logger.info("matches.restore.ok", { id: match._id });
  } catch (error: any) {
    logger.error("matches.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to Restore Match" };
  }

  revalidatePath(`/tournament/${tid}/schedule`);
  return { ok: true };
}
