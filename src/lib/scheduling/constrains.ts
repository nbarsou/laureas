// lib/scheduling/constraints.ts
import type {
  Ctx,
  HardConstraint,
  SoftConstraint,
  ConcreteSlot,
  Pairing,
} from "./types";

export const spreadOnePerDay: HardConstraint = (ctx, m, s) => {
  if (ctx.mode !== "spread") return true;
  const aDay = `${m.home}-${s.dateISO}`;
  const bDay = `${m.away}-${s.dateISO}`;
  if (ctx.teamAtDay.has(aDay) || ctx.teamAtDay.has(bDay))
    return "spread: team already plays that day";
  return true;
};

export const noVenueTimeClash: HardConstraint = (ctx, _m, s) => {
  const key = `${s.venueId}-${s.dateISO}-${s.start_time}`;
  return ctx.venueTimeUsed.has(key) ? "slot taken" : true;
};

export function pairingGroupId(pairing: Pairing, ctx: Ctx): string | null {
  const gHome = ctx.groupIdByTeam.get(String(pairing.home)) ?? null;
  const gAway = ctx.groupIdByTeam.get(String(pairing.away)) ?? null;
  // If you generated pairings by groups, both should coincide:
  return gHome ? String(gHome) : gAway ? String(gAway) : null;
}
/**
 * Only schedule a group's matches on its allowed days-of-week.
 * If a group has no allowed days configured, allow all (or flip to disallow all).
 */
export const onlyGroupAllowedDays: HardConstraint = (ctx, pairing, slot) => {
  const gid = pairingGroupId(pairing, ctx);
  if (!gid) return true; // no group → always allow (or return "group:missing" if you want stricter)

  const allowed = ctx.allowedDaysByGroup.get(gid);
  if (!allowed || allowed.size === 0) return true; // no rules configured → allow all

  return allowed.has(slot.day_of_week) ? true : "group:not-allowed-day"; // reason code
};

// bundle defaults
export const defaultHard: HardConstraint[] = [
  noVenueTimeClash,
  spreadOnePerDay,
  onlyGroupAllowedDays,
];
