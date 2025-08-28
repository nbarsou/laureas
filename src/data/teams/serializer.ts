// src/data/teams/serializer.ts
import { Types } from "mongoose";
import {
  TeamOut as TeamOutSchema,
  TeamGroupNameOut as TeamGroupNameOutSchema,
  type TeamOut as TeamOutT,
  type TeamGroupNameOut as TeamGroupNameOutT,
} from "./dto";

// Helpers
const toStr = (v: unknown): string =>
  v instanceof Types.ObjectId ? v.toString() : String(v);


/** Single row → TeamOut (strict shape for UI) */
export function toTeamOut(row: Record<string, any>): TeamOutT {
  const dto = {
    _id: toStr(row._id),
    tournamentId: toStr(row.tournamentId),
    ...(row.groupId != null ? { groupId: toStr(row.groupId) } : {}),
    name: String(row.name ?? ""),
    manager: String(row.manager ?? ""), // Zod enforces email
  };
  return TeamOutSchema.parse(dto);
}

export function toTeamGroupNameOut(
  row: Record<string, any>
): TeamGroupNameOutT {
  const dto = {
    _id: toStr(row._id),
    tournamentId: toStr(row.tournamentId),
    groupId: toStr(row.groupId),
    name: row.name != null ? String(row.name) : undefined,
    manager: row.manager != null ? String(row.manager) : undefined,
    // Only include when present
    ...(row.groupName != null
      ? { groupName: String(row.groupName) }
      : row.grp?.name != null
      ? { groupName: String(row.grp.name) }
      : {}),
  };
  return TeamGroupNameOutSchema.parse(dto);
}

/** Array helpers */
export const mapToTeamOut = (rows: Record<string, any>[]) =>
  rows.map(toTeamOut);
export const mapToTeamGroupNameOut = (rows: Record<string, any>[]) =>
  rows.map(toTeamGroupNameOut);
