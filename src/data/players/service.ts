// data/players/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { PlayerModel } from "@/data/players/model";

import { PlayerCreateIn, PlayerUpdateIn, PlayerOut } from "@/data/players/dto";

import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";

import { ActionResult, safeParseForm, zObjectId } from "@/data/_helpers";
import { toPlayerOut } from "./serializer";

/* ════════════════  C R E A T E  ════════════════ */

export async function createPlayer(
  tid: string, // TODO: Replace with slugs later.
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("players.create.start", { tid });

  const tidOk = zObjectId.safeParse(tid);
  if (!tidOk.success) {
    logger.warn("players.create.invalid_tournamentId", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, PlayerCreateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("players.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors,
    };
  }

  try {
    await getConn();

    const doc = await time("db.players.create", () =>
      PlayerModel.create(validated.data)
    );

    logger.info("players.create.ok", {
      id: String(doc._id),
      tournamentId: String(tid),
    });
  } catch (error: any) {
    logger.error("players.create.fail", error);
    return { ok: false, message: "Database Error: Failed to Create Player." };
  }

  revalidatePath(`/tournament/${tid}/players`);
  redirect(`/tournament/${tid}/players`);
}

/* ════════════════  R E A D  ════════════════ */

export async function getPlayer(playerId: string): Promise<PlayerOut | null> {
  logger.debug("players.get.start", { playerId });
  const id = zObjectId.safeParse(playerId);
  if (!id.success) {
    logger.warn("players.get.invalid_id", { playerId });
    throw new Error("Invalid player id");
  }
  let row;
  try {
    await getConn();
    row = await time("db.players.findById", () =>
      PlayerModel.findById(id.data).lean().exec()
    );
  } catch (error) {
    logger.error("players.get.db_conn", error);
    throw new Error("Database Error: Failed to fetch player.");
  }
  logger.debug("players.get.ok", { playerId });
  return row ? toPlayerOut(row) : null;
}

export async function listPlayers(
  tournamentId: string,
  limit = 100
): Promise<PlayerOut[] | null> {
  logger.debug("players.list.byTournament.start", { tournamentId });
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("players.list.byTournament.invalid_id", { tournamentId });
    throw new Error("Invalid tournament id");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.players.findByTournament", () =>
      PlayerModel.find({ tournamentId: id.data }).limit(limit).lean().exec()
    );
  } catch (error) {
    logger.error("players.list.byTournament.db_conn", error);
    throw new Error("Database Error: Failed to fetch players.");
  }

  logger.debug("players.list.byTournament.ok", { tournamentId });
  return rows ? rows.map(toPlayerOut) : null;
}

export async function listPlayersByTeam(
  teamId: string,
  limit = 100
): Promise<PlayerOut[] | null> {
  logger.debug("players.list.byTeam.start", { teamId });

  const teamIdValid = zObjectId.safeParse(teamId);
  if (!teamIdValid.success) {
    logger.warn("players.list.byTeam.invalid_id", { teamId });
    throw new Error("Invalid team id");
  }
  let rows;
  try {
    await getConn();
    rows = await time("db.players.findByTeam", () =>
      PlayerModel.find({ teamId: teamIdValid.data }).limit(limit).lean().exec()
    );
  } catch (error) {
    logger.error("players.list.byTeam.db_conn", error);
    throw new Error("Database Error: Failed to fetch players.");
  }

  // Get all players from those teams
  logger.debug("players.list.byTeam.ok", { teamId });
  return rows ? rows.map(toPlayerOut) : null;
}

/* ════════════════  U P D A T E  ════════════════ */
// TODO: Add playerId as a param.
export async function updatePlayer(
  tid: string, // TODO: Replace with slug
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("players.update.start", { tid });

  const idCheck = zObjectId.safeParse(formData.get("_id"));
  if (!idCheck.success) {
    logger.warn("players.update.invalid_id", { id: formData.get("_id") });
    return { ok: false, message: "Invalid player id." };
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, PlayerUpdateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("players.update.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      // values: stickyValuesHere,  // e.g. Object.fromEntries(formData)
    };
  }

  const { _id, ...patch } = validated.data;
  if (!_id) {
    logger.warn("players.update.missing_id");
    return { ok: false, message: "Missing player id." };
  }

  try {
    await getConn();
    const updated = await time("db.players.updateById", () =>
      PlayerModel.findByIdAndUpdate(_id, patch, {
        runValidators: true,
        new: false,
      }).exec()
    );
    if (!updated) {
      logger.warn("teams.update.not_found", { id: _id });
      return { ok: false, message: "Player not found." };
    }
    logger.info("players.update.ok", { id: String(_id) });
  } catch (error: any) {
    logger.error("players.update.fail", error);
    return { ok: false, message: "Database Error: Failed to Update Player." };
  }

  revalidatePath(`/tournament/${tid}/players`); // TODO: adjust later
  redirect(`/tournament/${tid}/players`);
}

/* ════════════════  D E L E T E  (soft) ════════════════ */
export async function deletePlayer(
  tid: string,
  playerId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(playerId);
  if (!id.success) {
    logger.warn("players.delete.invalid_id", { playerId });
    return { ok: false, message: "Invalid player id." };
  }

  try {
    await getConn();
    const player = await time("db.players.findById", () =>
      PlayerModel.findById(id.data).exec()
    );

    if (!player) {
      logger.warn("players.delete.not_found", { playerId });
      return { ok: false, message: "Player not found." };
    }
    await time("db.players.softDelete", () =>
      (player as any).softDelete(by, reason)
    );
    logger.info("players.delete.ok", { playerId });
  } catch (error: any) {
    logger.error("player.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to Delete Player." };
  }

  revalidatePath(`/tournament/${tid}/players`);
  return { ok: true };
}
export async function restorePlayer(
  tid: string,
  playerId: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(playerId);
  if (!id.success) {
    logger.warn("players.restore.invalid_id", { playerId });
    return { ok: false, message: "Invalid player id." };
  }

  try {
    await getConn();
    const player = await time("db.players.findById", () =>
      PlayerModel.findById(id.data).exec()
    );

    if (!player) {
      logger.warn("players.restore.not_found", { playerId });
      return { ok: false, message: "Player not found." };
    }
    await time("db.players.restore", () => (player as any).restore());
    logger.info("players.restore.ok", { playerId });
  } catch (error: any) {
    logger.error("players.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to Restore Player." };
  }

  revalidatePath(`/tournament/${tid}/players`);
  return { ok: true };
}
