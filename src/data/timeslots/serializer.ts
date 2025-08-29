// src/data/timeslots/serializer.ts
import { Types } from "mongoose";
import {
  TimeslotOut as TimeslotOutSchema,
  // TimeslotHydratedOut as TimeslotHydratedOutSchema,
  type TimeslotOut,
  // type TimeslotHydratedOut,
} from "./dto";

// Helpers
const toStr = (v: unknown): string =>
  v instanceof Types.ObjectId ? v.toHexString() : String(v);

const toNum = (v: unknown): number => (typeof v === "number" ? v : Number(v));

/* ─────────────────── TimeslotOut ─────────────────── */

export function toTimeslotOut(row: Record<string, any>): TimeslotOut {
  const dto = {
    _id: toStr(row._id),
    venue_id: toStr(row.venue_id),
    day_of_week: toNum(row.day_of_week),
    start_time: String(row.start_time ?? ""),
    end_time: String(row.end_time ?? ""),
    // Let zod defaults apply if missing/undefined
    timezone: row.timezone === undefined ? undefined : String(row.timezone),
    label: row.label === undefined ? undefined : String(row.label),
  };
  return TimeslotOutSchema.parse(dto);
}

export const mapToTimeslotOut = (rows: Record<string, any>[]): TimeslotOut[] =>
  rows.map(toTimeslotOut);

// /* ───────────────── TimeslotHydratedOut ────────────── */

// export function toTimeslotHydratedOut(
//   row: Record<string, any>
// ): TimeslotHydratedOut {
//   // Accept either `venue` or populated `venue_id` object
//   const venueSrc = row.venue ?? row.venue_id;
//   const dto = {
//     _id: toStr(row._id),
//     day_of_week: toNum(row.day_of_week),
//     start_time: String(row.start_time ?? ""),
//     end_time: String(row.end_time ?? ""),
//     timezone: row.timezone === undefined ? undefined : String(row.timezone),
//     label: row.label === undefined ? undefined : String(row.label),
//     venue: {
//       _id: toStr(venueSrc?._id),
//       name: String(venueSrc?.name ?? ""),
//     },
//   };
//   return TimeslotHydratedOutSchema.parse(dto);
// }
