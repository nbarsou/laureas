import "dotenv/config";
import mongoose, { Types } from "mongoose";
import { getConn } from "@/lib/db";

import { seedTournament } from "@/lib/scripts/seedTournament"; // or "@/lib/scripts/seedTournament"

import { TournamentModel } from "@/data/tournaments/schema";
import { TeamModel, type TeamDb } from "@/data/teams/schema";
import { MatchModel } from "@/data/matches/schema";
import { VenueModel } from "@/data/venues/schema";
import { TimeslotModel } from "@/data/timeslots/schema";

import { expandWeeklySlots } from "@/lib/scheduling/slots";
import { generateByGroups } from "@/lib/scheduling/roundRobin";
import { scheduleGreedy } from "@/lib/scheduling/scheduler";
import {
  noVenueTimeClash,
  onlyGroupAllowedDays,
  spreadOnePerDay,
} from "@/lib/scheduling/constrains";
import type { Pairing, Ctx, ConcreteSlot } from "@/lib/scheduling/types";
import { GroupModel } from "@/data/groups/schema";

// -------------------- types & helpers --------------------
type WeeklySlotDoc = {
  venue_id: Types.ObjectId;
  day_of_week: number; // 0..6 (your schema uses 1..6; keep consistent)
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function loadTournament(tid: Types.ObjectId) {
  const t = await TournamentModel.findById(tid).lean();
  if (!t) throw new Error(`Tournament not found: ${tid}`);
  if (!t.startDate || !t.endDate)
    throw new Error("Tournament missing start/end dates.");
  return t;
}

function groupTeamsByGroupId(
  teams: Array<Pick<TeamDb, "_id" | "groupId">>,
  requireGroups: boolean
): Map<string, Types.ObjectId[]> {
  const map = new Map<string, Types.ObjectId[]>();
  for (const t of teams) {
    if (requireGroups && !t.groupId) continue;
    const gid = t.groupId ? String(t.groupId) : "";
    const list = map.get(gid) ?? [];
    list.push(new Types.ObjectId(t._id));
    map.set(gid, list);
  }
  if (requireGroups) map.delete(""); // drop ungrouped bucket
  return map;
}
async function buildCtxSpread(tournamentId: Types.ObjectId): Promise<Ctx> {
  // 1) Start with existing usage guards
  const already = await MatchModel.find({
    tournamentId,
    date: { $exists: true },
  })
    .select({
      venueId: 1,
      date: 1,
      start_time: 1,
      homeTeamId: 1,
      awayTeamId: 1,
    })
    .lean();

  const venueTimeUsed = new Set<string>();
  const teamAtTime = new Set<string>();
  const teamAtDay = new Set<string>();
  for (const m of already) {
    const dISO = isoDate(new Date(m.date!));
    venueTimeUsed.add(`${m.venueId}-${dISO}-${m.start_time}`);
    teamAtTime.add(`${m.homeTeamId}-${dISO}-${m.start_time}`);
    teamAtTime.add(`${m.awayTeamId}-${dISO}-${m.start_time}`);
    teamAtDay.add(`${m.homeTeamId}-${dISO}`);
    teamAtDay.add(`${m.awayTeamId}-${dISO}`);
  }

  // 2) Load teams -> groupId
  const teams = await TeamModel.find({ tournamentId })
    .select({ _id: 1, groupId: 1 })
    .lean<Pick<TeamDb, "_id" | "groupId">[]>();

  const groupIdByTeam = new Map<string, Types.ObjectId | null>();
  for (const t of teams) {
    groupIdByTeam.set(String(t._id), (t as any).groupId ?? null);
  }

  // 3) Load groups -> allowed days (from availability.allowed keys)
  const groups = await GroupModel.find({ tournamentId })
    .select({ _id: 1, availability: 1 })
    .lean<
      { _id: Types.ObjectId; availability?: { allowed?: Map<string, any> } }[]
    >();

  const allowedDaysByGroup = new Map<string, Set<number>>();
  for (const g of groups) {
    const set = new Set<number>();
    const allowed = g.availability?.allowed;
    // Map<string, [...]> may come back as a plain object in lean(); handle both
    const entries =
      allowed instanceof Map
        ? allowed.entries()
        : Object.entries(allowed ?? {});
    for (const [dowStr, windows] of entries as Iterable<[string, any]>) {
      const dow = Number(dowStr);
      if (!Number.isNaN(dow)) set.add(dow);
    }
    allowedDaysByGroup.set(String(g._id), set);
  }

  return {
    mode: "spread",
    tournamentId,
    venueTimeUsed,
    teamAtTime,
    teamAtDay,

    groupIdByTeam,
    allowedDaysByGroup,
    groupAtVenueDay: new Set<string>(),
    // groupAtDay: new Set<string>(),

    incompatiblePairs: new Set(),
    allowedWindowsByTeam: new Map(),
    preferredStartsByTeam: new Map(),
  };
}

// -------------------- constants --------------------
const DOUBLE_ROUND_ROBIN = false; // or true
const REQUIRE_GROUPS = true;

// -------------------- main --------------------
async function run() {
  await getConn();

  // ⬇️ one simple call
  const {
    tournamentId: tid,
    startDate,
    endDate,
  } = await seedTournament(DOUBLE_ROUND_ROBIN);

  // (optional) load the tourney doc if you need settings/name
  const t = await TournamentModel.findById(tid).lean();
  if (!t) throw new Error(`Tournament not found: ${tid}`);

  // 1) Slots (typed)
  const venues = await VenueModel.find({ tournamentId: tid })
    .select({ _id: 1 })
    .lean();
  const venueIds = venues.map((v) => String(v._id));

  const weekly = await TimeslotModel.find({
    is_active: true,
    venue_id: { $in: venueIds },
  })
    .select({ venue_id: 1, day_of_week: 1, start_time: 1, end_time: 1 })
    .lean<WeeklySlotDoc[]>();

  const slots: ConcreteSlot[] = expandWeeklySlots(
    weekly,
    startDate,
    endDate,
    new Set(venueIds)
  );
  if (slots.length === 0)
    throw new Error("No concrete slots generated—check timeslots and dates.");

  // 2) Teams (typed) and pairings
  const teams: TeamDb[] = await TeamModel.find({ tournamentId: tid })
    .sort({ name: 1 })
    .lean<TeamDb[]>();
  if (teams.length < 2) throw new Error("Need at least 2 teams.");

  const grouped = groupTeamsByGroupId(teams, REQUIRE_GROUPS);
  if (grouped.size === 0)
    throw new Error("No valid groups found (teams missing groupId?).");

  const pairings: Pairing[] = generateByGroups(grouped, DOUBLE_ROUND_ROBIN);

  console.log(
    `Groups: ${grouped.size}, Teams: ${teams.length}, Pairings to schedule: ${pairings.length}`
  );

  // 3) Context (spread mode = one game per team per day)
  const ctx = await buildCtxSpread(tid);

  // 4) Drop pairings already scheduled (idempotency)
  const alreadyScheduled = await MatchModel.find({
    tournamentId: tid,
    date: { $exists: true },
  })
    .select({ round: 1, leg: 1, homeTeamId: 1, awayTeamId: 1 })
    .lean();

  const scheduledKey = new Set(
    alreadyScheduled.map(
      (m) =>
        `${m.round}|${m.leg}|${String(m.homeTeamId)}|${String(m.awayTeamId)}`
    )
  );

  const toSchedule: Pairing[] = pairings.filter(
    (m) =>
      !scheduledKey.has(
        `${m.round}|${m.leg}|${String(m.home)}|${String(m.away)}`
      )
  );

  // 5) Schedule with minimal hard checks: no slot double-book + one per day
  const HARD = [noVenueTimeClash, spreadOnePerDay, onlyGroupAllowedDays];
  const { scheduled, conflicts } = await scheduleGreedy(
    ctx,
    toSchedule,
    slots,
    { sortBy: "round" },
    HARD,
    [] // no soft prefs
  );

  // 6) Ensure remaining matches exist as pending (no date set)
  const after = await MatchModel.find({
    tournamentId: tid,
    date: { $exists: true },
  })
    .select({ round: 1, leg: 1, homeTeamId: 1, awayTeamId: 1 })
    .lean();

  const afterKey = new Set(
    after.map(
      (m) =>
        `${m.round}|${m.leg}|${String(m.homeTeamId)}|${String(m.awayTeamId)}`
    )
  );

  const pendings: Pairing[] = toSchedule.filter(
    (m) =>
      !afterKey.has(`${m.round}|${m.leg}|${String(m.home)}|${String(m.away)}`)
  );

  if (pendings.length) {
    await MatchModel.bulkWrite(
      pendings.map((m) => ({
        updateOne: {
          filter: {
            tournamentId: tid,
            round: m.round,
            leg: m.leg,
            homeTeamId: m.home,
            awayTeamId: m.away,
            date: { $exists: false },
          },
          update: {
            $set: { status: "pending" },
            $setOnInsert: {
              tournamentId: tid,
              round: m.round,
              leg: m.leg,
              homeTeamId: m.home,
              awayTeamId: m.away,
            },
          },
          upsert: true,
        },
      }))
    );
  }

  console.log(
    JSON.stringify(
      {
        scheduled,
        pending: toSchedule.length - scheduled,
        pairings_total: pairings.length,
        pairings_considered: toSchedule.length,
        slots: slots.length,
        conflicts,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
