// src/data/players/serializer.ts
import { Types } from "mongoose";
import { PlayerOut as PlayerOutSchema, type PlayerOut } from "./dto";

// Helpers
const toStr = (v: unknown): string =>
  v instanceof Types.ObjectId ? v.toHexString() : String(v);

/** Single row → PlayerOut */
export function toPlayerOut(row: Record<string, any>): PlayerOut {
  const dto = {
    _id: toStr(row._id),
    teamId: toStr(row.teamId), // zObjectId in schema → string here
    firstName: String(row.firstName ?? ""),
    lastName: String(row.lastName ?? ""),
    number: typeof row.number === "number" ? row.number : Number(row.number),
  };
  return PlayerOutSchema.parse(dto);
}

/** Array helper */
export const mapToPlayerOut = (rows: Record<string, any>[]): PlayerOut[] =>
  rows.map(toPlayerOut);
