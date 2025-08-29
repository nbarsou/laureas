// src/data/venues/serializer.ts
import { Types } from "mongoose";
import { VenueOut as VenueOutSchema, type VenueOut } from "./dto"; // adjust path if needed

// Helpers
const toStr = (v: unknown): string =>
  v instanceof Types.ObjectId ? v.toHexString() : String(v);

/** Single row → VenueOut */
export function toVenueOut(row: Record<string, any>): VenueOut {
  const dto = {
    _id: toStr(row._id),
    tournamentId: toStr(row.tournamentId),
    name: String(row.name ?? ""),
    address: String(row.address ?? ""),
    // default to "other" if missing; zod will validate enum membership
    surface_type: String(row.surface_type ?? "other"),
  };
  return VenueOutSchema.parse(dto);
}
