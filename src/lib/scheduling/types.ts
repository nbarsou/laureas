// lib/scheduling/types.ts
import { Types } from "mongoose";

export type ObjId = Types.ObjectId;
export type IsoDate = string; // "YYYY-MM-DD"
export type HHMM = string; // "HH:mm"
export const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type Pairing = {
  round: number;
  leg: 1 | 2;
  home: ObjId;
  away: ObjId;
  groupId?: ObjId; // optional, if groups enabled
  // NOTE: we sometimes attach tournamentId ad-hoc during scheduling
  // (scheduler casts to any), but you can extend this type if you prefer.
};

export type ConcreteSlot = {
  venueId: ObjId;
  dateISO: IsoDate;
  start_time: HHMM;
  end_time: HHMM;
  day_of_week: number; // 0..6 (Sun..Sat)
};

export type ScheduleOptions = {
  mode: "spread" | "compressed"; // one match per team per day?
  doubleRoundRobin: boolean;
  maxBacktracks?: number; // future: smarter search
};

export type CapacityReport = {
  demand: number;
  supply: number;
  deficit: number; // max(0, demand - supply)
  perDay?: Record<IsoDate, { demand: number; supply: number; deficit: number }>;
};

export type HardConstraint = (
  ctx: Ctx,
  m: Pairing,
  s: ConcreteSlot
) => true | string; // true ok, string = reason
export type SoftConstraint = (ctx: Ctx, m: Pairing, s: ConcreteSlot) => number; // higher is better

export type Ctx = {
  mode: "spread" | "compressed";
  tournamentId: ObjId;

  // fast lookups
  venueTimeUsed: Set<string>; // `${venueId}-${dateISO}-${start}`
  teamAtTime: Set<string>; // `${teamId}-${dateISO}-${start}`
  teamAtDay: Set<string>; // `${teamId}-${dateISO}`

  // NEW — group-aware context
  groupIdByTeam: Map<string, Types.ObjectId | null>; // teamId -> groupId (or null)
  allowedDaysByGroup: Map<string, Set<number>>; // groupId -> allowed DOW (0..6)
  groupAtVenueDay: Set<string>; // “venueId|YYYY-MM-DD” -> groupId pinned
  // groupAtDay: Set<string>; // (optional) “YYYY-MM-DD|groupId” -> guard one match per group per day

  // restrictions / availability (precomputed)
  incompatiblePairs: Set<string>; // `${home}-${away}` both directions
  allowedWindowsByTeam: Map<
    string,
    Array<{ dow: number; start: HHMM; end: HHMM }>
  >;
  preferredStartsByTeam: Map<string, HHMM[]>;
};
