import "dotenv/config";
import mongoose, { Types } from "mongoose";
import { getConn } from "@/lib/db";

import { TournamentModel } from "@/data/tournaments/schema";
import { TeamModel, type TeamDb } from "@/data/teams/schema";
import { MatchModel } from "@/data/matches/schema";
import { VenueModel } from "@/data/venues/schema";
import { TimeslotModel } from "@/data/timeslots/schema";
import { GroupModel } from "@/data/groups/schema";

import { expandWeeklySlots } from "@/lib/scheduling/slots";
import { generateByGroups } from "@/lib/scheduling/roundRobin";
import { scheduleGreedy } from "@/lib/scheduling/scheduler";
import { defaultHard } from "@/lib/scheduling/constraints";
import type { Pairing, Ctx, ConcreteSlot } from "@/lib/scheduling/types";

// ────────────────────────────────────────────────────────────────────────────────
// CONFIG → Edit this to demo different setups quickly
// ────────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  // If you want to attach to an existing tournament, set tournamentId and omit name
  tournament: {
    tournamentId: undefined as string | undefined,
    name: "New Test League – August",
    startDate: new Date("2025-08-26"),
    endDate: new Date("2025-09-30"),
    doubleRoundRobin: false,
    requireGroups: true,
  },

  // Create or upsert venues by name for this tournament
  venues: [
    {
      name: "Field Alpha",
      address: "Av. Paseo de la Reforma 123, Cuauhtémoc, CDMX",
    },
    {
      name: "Field Beta",
      address: "Av. Insurgentes Sur 456, Benito Juárez, CDMX",
    },
  ],

  // Define groups (availability.allowed uses day_of_week 0..6, 0=Sun)
  groups: [
    { name: "Group A", allowedDays: [2, 4] }, // Tue & Thu
    { name: "Group B", allowedDays: [6, 0] }, // Sat & Sun
  ],

  // Teams by group name; any name not listed under a defined group is treated as ungrouped
  teamsByGroup: {
    "Group A": ["Lions", "Tigers", "Bulls", "Wolves"],
    "Group B": ["Eagles", "Sharks", "Falcons", "Bears"],
  } as Record<string, string[]>,

  // Weekly timeslots (0..6, 0=Sun) → engine will expand to concrete slots in [startDate, endDate]
  weekly: [
    // Field Alpha
    {
      venue: "Field Alpha",
      day_of_week: 2,
      start_time: "18:00",
      end_time: "19:00",
      is_active: true,
    },
    {
      venue: "Field Alpha",
      day_of_week: 4,
      start_time: "18:00",
      end_time: "19:00",
      is_active: true,
    },
    {
      venue: "Field Alpha",
      day_of_week: 6,
      start_time: "09:00",
      end_time: "10:00",
      is_active: true,
    },
    // Field Beta
    {
      venue: "Field Beta",
      day_of_week: 2,
      start_time: "19:15",
      end_time: "20:15",
      is_active: true,
    },
    {
      venue: "Field Beta",
      day_of_week: 4,
      start_time: "19:15",
      end_time: "20:15",
      is_active: true,
    },
    {
      venue: "Field Beta",
      day_of_week: 0,
      start_time: "11:00",
      end_time: "12:00",
      is_active: true,
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────────
// helpers
// ────────────────────────────────────────────────────────────────────────────────
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function asAllowedMap(days: number[]): Record<string, any[]> {
  // Store as plain object; your schema may coerce to Map under the hood
  const obj: Record<string, any[]> = {};
  for (const d of days) obj[String(d)] = [];
  return obj;
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
  if (requireGroups) map.delete("");
  return map;
}

async function buildCtxSpread(tournamentId: Types.ObjectId): Promise<Ctx> {
  // Existing scheduled matches → guard against conflicts
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

  // Load teams → groupId
  const teams = await TeamModel.find({ tournamentId })
    .select({ _id: 1, groupId: 1 })
    .lean<Pick<TeamDb, "_id" | "groupId">[]>();

  const groupIdByTeam = new Map<string, Types.ObjectId | null>();
  for (const t of teams)
    groupIdByTeam.set(String(t._id), (t as any).groupId ?? null);

  // Load groups → allowed days
  const groups = await GroupModel.find({ tournamentId })
    .select({ _id: 1, availability: 1 })
    .lean<
      { _id: Types.ObjectId; availability?: { allowed?: Map<string, any> } }[]
    >();

  const allowedDaysByGroup = new Map<string, Set<number>>();
  for (const g of groups) {
    const allowed = g.availability?.allowed;
    const keys: string[] =
      allowed instanceof Map
        ? Array.from(allowed.keys())
        : Object.keys(allowed ?? {});

    const rawNums = keys
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n)) as number[];

    // If all keys are in 1..7 (and none is 0), treat as one-based and normalize → 0..6
    const looksOneBased =
      rawNums.length > 0 &&
      rawNums.every((n) => n >= 1 && n <= 7) &&
      !rawNums.includes(0);

    const norm = new Set<number>();
    for (const n of rawNums) {
      let z = n;
      if (looksOneBased) z = n % 7; // 7 → 0, 1..6 unchanged
      if (z === 7) z = 0; // extra guard if mixed data
      if (z >= 0 && z <= 6) norm.add(z);
    }

    allowedDaysByGroup.set(String(g._id), norm);
  }

  // Debug: show normalized allowed DOWs per group
  if (process.env.NODE_ENV !== "production") {
    const dbg = Object.fromEntries(
      Array.from(allowedDaysByGroup.entries()).map(([gid, set]) => [
        gid,
        Array.from(set).sort(),
      ])
    );
    console.log("[scheduler] allowedDaysByGroup (normalized 0..6):", dbg);
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
    incompatiblePairs: new Set(),
    allowedWindowsByTeam: new Map(),
    preferredStartsByTeam: new Map(),
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────────────────────
async function run() {
  await getConn();

  const { tournamentId, startDate, endDate } = await ensureTournament();
  const venueIds = await ensureVenues(tournamentId);
  const groupIds = await ensureGroups(tournamentId);
  await ensureTeams(tournamentId, groupIds);
  await ensureTimeslots(venueIds);

  // Expand slots between start/end
  const weekly = await TimeslotModel.find({
    is_active: true,
    venue_id: { $in: venueIds.map(String) },
  })
    .select({ venue_id: 1, day_of_week: 1, start_time: 1, end_time: 1 })
    .lean<
      {
        venue_id: Types.ObjectId;
        day_of_week: number;
        start_time: string;
        end_time: string;
      }[]
    >();

  const slots: ConcreteSlot[] = expandWeeklySlots(
    weekly as any,
    startDate,
    endDate,
    new Set(venueIds.map(String))
  );
  if (slots.length === 0)
    throw new Error("No concrete slots generated—check timeslots and dates.");

  // Load teams & generate pairings
  const teams: TeamDb[] = await TeamModel.find({ tournamentId })
    .sort({ name: 1 })
    .lean<TeamDb[]>();
  if (teams.length < 2) throw new Error("Need at least 2 teams.");

  const grouped = groupTeamsByGroupId(teams, CONFIG.tournament.requireGroups);
  if (grouped.size === 0)
    throw new Error("No valid groups found (teams missing groupId?).");

  const pairings: Pairing[] = generateByGroups(
    grouped,
    CONFIG.tournament.doubleRoundRobin
  );
  console.log(
    `Groups: ${grouped.size}, Teams: ${teams.length}, Pairings: ${pairings.length}`
  );

  const ctx = await buildCtxSpread(tournamentId);

  // Drop pairings already scheduled (idempotency)
  const alreadyScheduled = await MatchModel.find({
    tournamentId,
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

  // Hard constraints only for the demo (no soft prefs)
  const HARD = defaultHard;
  const { scheduled, conflicts } = await scheduleGreedy(
    ctx,
    toSchedule,
    slots,
    { sortBy: "round" },
    HARD,
    []
  );

  // Ensure remaining matches exist as pending
  const after = await MatchModel.find({ tournamentId, date: { $exists: true } })
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
            tournamentId,
            round: m.round,
            leg: m.leg,
            homeTeamId: m.home,
            awayTeamId: m.away,
            date: { $exists: false },
          },
          update: {
            $set: { status: "pending" },
            $setOnInsert: {
              tournamentId,
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

// ────────────────────────────────────────────────────────────────────────────────
// ensure helpers (idempotent upserts)
// ────────────────────────────────────────────────────────────────────────────────
async function ensureTournament() {
  const { tournamentId, name, startDate, endDate } = CONFIG.tournament;

  if (tournamentId) {
    const t = await TournamentModel.findById(tournamentId).lean();
    if (!t) throw new Error(`Tournament not found: ${tournamentId}`);
    if (!t.startDate || !t.endDate)
      throw new Error("Tournament missing start/end dates.");
    return {
      tournamentId: new Types.ObjectId(t._id),
      startDate: new Date(t.startDate),
      endDate: new Date(t.endDate),
    };
  }

  // Find by name+dates or create
  const existing = await TournamentModel.findOne({
    name,
    startDate,
    endDate,
  }).lean();
  if (existing) {
    return {
      tournamentId: new Types.ObjectId(existing._id),
      startDate: new Date(existing.startDate!),
      endDate: new Date(existing.endDate!),
    };
  }

  const created = await TournamentModel.create({
    ownerId: new Types.ObjectId(),
    name,
    startDate,
    endDate,
    status: "draft",
  });
  return { tournamentId: new Types.ObjectId(created._id), startDate, endDate };
}

async function ensureVenues(tournamentId: Types.ObjectId) {
  type VenueCfg = { name: string; address?: string };
  const cfg: VenueCfg[] = CONFIG.venues as any;
  const names = cfg.map((v) => v.name);

  // Map existing by name for quick reuse
  const existing = await VenueModel.find({ tournamentId, name: { $in: names } })
    .select({ _id: 1, name: 1 })
    .lean();
  const existingByName = new Map(
    existing.map((v: any) => [v.name, new Types.ObjectId(v._id)])
  );

  const ids: Types.ObjectId[] = [];
  for (const v of cfg) {
    const found = existingByName.get(v.name);
    const address = v.address ?? "Demo address – to be confirmed";

    const doc = await VenueModel.findOneAndUpdate(
      { tournamentId, name: v.name },
      {
        // Use ONLY $set here to avoid ConflictingUpdateOperators on upsert
        $set: {
          address,
        },
        $setOnInsert: {
          tournamentId,
          name: v.name,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    ids.push(new Types.ObjectId(doc!._id));
  }
  return ids;
}

async function ensureGroups(tournamentId: Types.ObjectId) {
  const map = new Map<string, Types.ObjectId>();
  for (const g of CONFIG.groups) {
    const availability = { allowed: asAllowedMap(g.allowedDays) };
    const doc = await GroupModel.findOneAndUpdate(
      { tournamentId, name: g.name },
      { $setOnInsert: { tournamentId, name: g.name }, $set: { availability } },
      { upsert: true, new: true }
    ).lean();
    map.set(g.name, new Types.ObjectId(doc!._id));
  }
  return map; // name → _id
}

async function ensureTeams(
  tournamentId: Types.ObjectId,
  groupsByName: Map<string, Types.ObjectId>
) {
  // Flatten config into {name, groupId}
  const items: { name: string; groupId?: Types.ObjectId }[] = [];
  for (const [groupName, names] of Object.entries(CONFIG.teamsByGroup)) {
    for (const name of names) {
      items.push({ name, groupId: groupsByName.get(groupName) });
    }
  }

  for (const t of items) {
    await TeamModel.findOneAndUpdate(
      { tournamentId, name: t.name },
      {
        $setOnInsert: { tournamentId, name: t.name },
        $set: { groupId: t.groupId },
      },
      { upsert: true, new: true }
    ).lean();
  }
}

async function ensureTimeslots(venueIds: Types.ObjectId[]) {
  // Upsert by (venue_id, day_of_week, start_time, end_time)
  const venueByName = new Map<string, Types.ObjectId>();
  // Load venue docs for name→id map
  const docs = await VenueModel.find({ _id: { $in: venueIds } })
    .select({ _id: 1, name: 1 })
    .lean();
  for (const v of docs as any[])
    venueByName.set(v.name, new Types.ObjectId(v._id));

  for (const s of CONFIG.weekly) {
    const venue_id = venueByName.get(s.venue);
    if (!venue_id) throw new Error(`Unknown venue in weekly slot: ${s.venue}`);

    await TimeslotModel.findOneAndUpdate(
      {
        venue_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      },
      {
        $setOnInsert: {
          venue_id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        },
        $set: { is_active: s.is_active },
      },
      { upsert: true, new: true }
    ).lean();
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// DANGER ZONE: Uncomment to wipe matches & timeslots for this tournament
// async function resetTournament(tournamentId: Types.ObjectId) {
//   await MatchModel.deleteMany({ tournamentId });
//   const venueIds = (await VenueModel.find({ tournamentId }).select({ _id: 1 }).lean()).map((v: any) => v._id);
//   await TimeslotModel.deleteMany({ venue_id: { $in: venueIds } });
// }
// ────────────────────────────────────────────────────────────────────────────────

run().catch((e) => {
  console.error(e);
  mongoose.disconnect().finally(() => process.exit(1));
});
