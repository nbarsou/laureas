// src/data/groups/serializer.ts
import { Types } from "mongoose";
import { GroupOut as GroupOutSchema, type GroupOut } from "./dto";

// Helpers
const toStr = (v: unknown): string =>
  v instanceof Types.ObjectId ? v.toHexString() : String(v);

/** Single row → GroupOut */
export function toGroupOut(row: Record<string, any>): GroupOut {
  const dto = {
    _id: toStr(row._id),
    tournamentId: toStr(row.tournamentId), // zObjectId in schema → string here
    name: String(row.name ?? ""),
  };

  return GroupOutSchema.parse(dto);
}

/** Array helper */
export const mapToGroupOut = (rows: Record<string, any>[]): GroupOut[] =>
  rows.map(toGroupOut);
