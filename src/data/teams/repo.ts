// src/data/teams/repo.ts
"use server";

import { getConn } from "@/lib/db";
import { time } from "@/lib/logging/timing";
import { TeamModel } from "./model";
import { TeamCreateIn, TeamUpdateIn, TeamGroupNameOut } from "./dto";

/** CREATE */
export async function createTeamRepo(input: TeamCreateIn): Promise<string> {
  await getConn();
  const doc = await time("db.teams.create", () => TeamModel.create(input));
  return String(doc._id);
}

/** UPDATE */
export async function updateTeamRepo(input: TeamUpdateIn): Promise<boolean> {
  const { _id, ...patch } = input;
  await getConn();
  const updated = await time("db.teams.updateById", () =>
    TeamModel.findByIdAndUpdate(_id, patch, {
      runValidators: true,
      new: false,
    }).exec()
  );
  return !!updated;
}

/** READ: one */
export async function getTeamRepo(id: any) {
  await getConn();
  return await time("db.teams.findById", () =>
    TeamModel.findById(id).lean().exec()
  );
}

/** READ: list by tournament */
export async function listTeamsRepo(tournamentId: any, limit = 100) {
  await getConn();
  return await time("db.teams.findByTournament", () =>
    TeamModel.find({ tournamentId }).limit(limit).lean().exec()
  );
}

/** SOFT DELETE / RESTORE */
export async function softDeleteTeamRepo(
  id: any,
  by?: string,
  reason?: string
): Promise<boolean> {
  await getConn();
  const team = await time("db.teams.getForDelete", () =>
    TeamModel.findById(id).exec()
  );
  if (!team) return false;
  await time("db.teams.softDelete", () =>
    (team as any).softDelete?.(by, reason)
  );
  return true;
}

export async function restoreTeamRepo(id: any): Promise<boolean> {
  await getConn();
  const team = await time("db.teams.getForRestore", () =>
    TeamModel.findById(id).exec()
  );
  if (!team) return false;
  await time("db.teams.restore", () => (team as any).restore());
  return true;
}
