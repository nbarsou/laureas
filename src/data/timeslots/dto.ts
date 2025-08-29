import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

/* ---------- helpers ---------- */
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const zHHMM = z.string().regex(HHMM, "Expected time in HH:mm (00:00–23:59)");

const zDOW = z
  .number()
  .int()
  .min(0, "day_of_week must be 0..6 (Sun..Sat)")
  .max(6, "day_of_week must be 0..6 (Sun..Sat)");

export const TimeslotCreateIn = z.object({
  venue_id: zObjectId, // reference to Venue
  day_of_week: zDOW, // 0=Sun ... 6=Sat
  start_time: zHHMM,
  end_time: zHHMM,
  timezone: z.string().min(1).default("America/Mexico_City"),
  label: z.string().max(80).optional(), // e.g., "Prime Slot", "Youth"
});
export type TimeslotCreateIn = z.infer<typeof TimeslotCreateIn>;

export const TimeslotUpdateIn = TimeslotCreateIn.partial().extend({
  _id: zObjectId,
});

export type TimeslotUpdateIn = z.infer<typeof TimeslotUpdateIn>;

export const TimeslotOut = z.object({
  _id: z.string(),
  venue_id: z.string(), // reference to Venue
  day_of_week: zDOW, // 0=Sun ... 6=Sat
  start_time: zHHMM,
  end_time: zHHMM,
  timezone: z.string().min(1).default("America/Mexico_City"),
  label: z.string().max(80).optional(), // e.g., "Prime Slot", "Youth"
});

export type TimeslotOut = z.infer<typeof TimeslotOut>;

// // ---------- HYDRATED OUT (with names) ----------
// const NamedRef = z.object({
//   _id: zObjectId,
//   name: z.string(),
// });

// export const TimeslotHydratedOut = TimeslotOut.extend({
//   venue: NamedRef,
// }).omit({ venue_id: true });

// export type TimeslotHydratedOut = z.infer<typeof TimeslotHydratedOut>;
