// lib/scheduling/slots.ts
import { addDays, startOfDay, format } from "date-fns";
import type { ConcreteSlot, IsoDate, HHMM, CapacityReport } from "./types";
import { Types } from "mongoose";

export function nextDow(base: Date, targetDow: number) {
  const d0 = startOfDay(base); // local midnight
  const delta = (targetDow - d0.getDay() + 7) % 7;
  return addDays(d0, delta || 7); // next occurrence (skip same-day)
}

export function isoLocalDate(d: Date): IsoDate {
  return format(d, "yyyy-MM-dd"); // ← no UTC conversion
}

export function expandWeeklySlots(
  weekly: Array<{
    venue_id: any;
    day_of_week: number; // 0..6 (Sun..Sat)
    start_time: HHMM;
    end_time: HHMM;
  }>,
  startDate: Date,
  endDate: Date,
  allowedVenueIds: Set<string>
): ConcreteSlot[] {
  const out: ConcreteSlot[] = [];

  for (const s of weekly) {
    if (!allowedVenueIds.has(String(s.venue_id))) continue;

    const first = nextDow(startDate, s.day_of_week);
    for (let d = first; d <= endDate; d = addDays(d, 7)) {
      out.push({
        venueId: new Types.ObjectId(s.venue_id),
        dateISO: isoLocalDate(d), // ← local-safe
        start_time: s.start_time,
        end_time: s.end_time,
        day_of_week: d.getDay(), // ← derive from actual date
      });
    }
  }

  out.sort(
    (a, b) =>
      a.dateISO.localeCompare(b.dateISO) ||
      a.start_time.localeCompare(b.start_time)
  );
  return out;
}
