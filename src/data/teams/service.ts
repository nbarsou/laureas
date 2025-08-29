// src/data/teams/service.ts
"use server";

import { zObjectId, type ActionResult } from "@/data/_helpers";
import { logger } from "@/lib/logging";
import { toTeamOut } from "./serializer";
import { TeamOut } from "./dto";
import {
  getTeamRepo,
  listTeamsRepo,
  softDeleteTeamRepo,
  restoreTeamRepo,
} from "./repo";

/** READ ONE */
export async function getTeam(teamId: string): Promise<TeamOut | null> {
  logger.debug("teams.get.start", { teamId });
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("teams.get.invalid_id", { teamId });
    throw new Error("Invalid team id");
  }
  const row = await getTeamRepo(id.data).catch((error) => {
    logger.error("teams.get.db_error", error);
    throw new Error("Database Error: Failed to fetch team.");
  });
  logger.debug("teams.get.ok", { teamId });
  return row ? toTeamOut(row) : null;
}

/** READ MANY */
export async function listTeams(
  tournamentId: string,
  limit = 100
): Promise<TeamOut[] | null> {
  logger.debug("teams.list.start", { tournamentId, limit });
  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("teams.list.invalid_id", { tournamentId });
    throw new Error("Invalid tournament id");
  }
  const rows = await listTeamsRepo(tid.data, limit).catch((error) => {
    logger.error("teams.list.db_error", error);
    throw new Error("Database Error: Failed to fetch teams.");
  });
  logger.debug("teams.list.ok", { tournamentId, count: rows?.length ?? 0 });
  return rows ? rows.map(toTeamOut) : null;
}

/** SOFT DELETE */
export async function softDeleteTeam(
  teamId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("teams.delete.invalid_id", { teamId });
    throw new Error("Invalid team id");
  }
  try {
    const ok = await softDeleteTeamRepo(id.data, by, reason);
    if (!ok) return { ok: false, message: "Team not found." };
    logger.info("teams.delete.ok", { teamId, by, reason });
    return { ok: true };
  } catch (error) {
    logger.error("teams.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to delete team." };
  }
}

/** RESTORE */
export async function restoreTeam(teamId: string): Promise<ActionResult> {
  const id = zObjectId.safeParse(teamId);
  if (!id.success) {
    logger.warn("teams.restore.invalid_id", { teamId });
    throw new Error("Invalid team id");
  }
  try {
    const ok = await restoreTeamRepo(id.data);
    if (!ok) return { ok: false, message: "Team not found." };
    logger.info("teams.restore.ok", { teamId });
    return { ok: true };
  } catch (error) {
    logger.error("teams.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to restore team." };
  }
}
