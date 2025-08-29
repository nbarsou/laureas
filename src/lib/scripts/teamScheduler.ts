/* Seed + schedule: 30 teams, 3 groups of 10
   Constraints:
     - Group A plays only on Monday
     - Group B plays only on Wednesday
     - Group C plays only on Friday
   Venues:
     - 3 venues, daily timeslots 15:00..22:00 (hourly), every day (Sun..Sat)

   Usage:
     pnpm tsx -r tsconfig-paths/register scripts/seed-30-groups.ts
*/

import mongoose, { Types } from "mongoose";
import { addDays, startOfDay } from "date-fns";
import { getConn } from "@/lib/db";
import { TournamentModel } from "@/data/tournaments/model";
import { TeamModel } from "@/data/teams/schema";
import { MatchModel } from "@/data/matches/schema";
import { VenueModel } from "@/data/venues/schema";
import { TimeslotModel } from "@/data/timeslots/schema";

type Pairing = {
  round: number;
  leg: 1 | 2;
  home: Types.ObjectId;
  away: Types.ObjectId;
  groupId?: Types.ObjectId;
};

type ConcreteSlot = {
  venueId: Types.ObjectId;
  dateISO: string; // 'YYYY-MM-DD'
  start_time: string;
  end_time: string;
};

const HH = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function nextDow(base: Date, targetDow: number) {
  const d0 = startOfDay(base);
  const delta = (targetDow - d0.getDay() + 7) % 7;
  return addDays(d0, delta || 7); // next occurrence (not today)
}

function generateRoundRobin(
  teamIds: Types.ObjectId[],
  double = false
): Pairing[] {
  const ids = [...teamIds];
  const BYE = new Types.ObjectId("000000000000000000000000");
  if (ids.length % 2 === 1) ids.push(BYE);

  const rounds = ids.length - 1;
  const half = ids.length / 2;

  let left = ids.slice(0, half);
  let right = ids.slice(half).reverse();

  const pairs: Pairing[] = [];
  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = left[i],
        b = right[i];
      if (a.equals(BYE) || b.equals(BYE)) continue;
      const homeFirst = r % 2 === 1;
      pairs.push({
        round: r,
        leg: 1,
        home: homeFirst ? a : b,
        away: homeFirst ? b : a,
      });
      if (double)
        pairs.push({
          round: r,
          leg: 2,
          home: homeFirst ? b : a,
          away: homeFirst ? a : b,
        });
    }
    const fixed = left[0];
    const movedFromLeft = left.pop()!;
    left = [fixed, right[0], ...left.slice(1)];
    right = right.slice(1).concat(movedFromLeft);
  }
  return pairs;
}

async function seedTournament(): Promise<{
  tournamentId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  groupIds: { A: Types.ObjectId; B: Types.ObjectId; C: Types.ObjectId };
}> {
  const now = new Date();
  const startDate = nextDow(now, 1); // next Monday
  const endDate = addDays(startDate, 7 * 12); // 12 weeks window (enough for 9 rounds)
  const ownerId = new Types.ObjectId();

  const tName = "League 30 (3x10)";
  let t = await TournamentModel.findOne({ name: tName }).lean();
  if (!t) {
    t = (
      await TournamentModel.create({
        name: tName,
        ownerId,
        startDate,
        endDate,
        settings: {
          schedulerMode: "spread",
          doubleRoundRobin: false,
          minGapMinutesSameDay: 60,
          maxBacktracks: 400,
          balancePreferredStarts: true,
          allowSameDayDoubleHeader: false,
          groupsEnabled: true,
          groupsMode: "manual",
        },
      })
    ).toObject();
    console.log(`Created tournament: ${t._id}`);
  } else {
    console.log(`Using tournament: ${t._id}`);
  }

  // 3 venues
  const [v1, v2, v3] = await Promise.all(
    ["Arena A", "Arena B", "Arena C"].map((name) =>
      VenueModel.findOneAndUpdate(
        { tournamentId: t._id, name },
        {
          $setOnInsert: {
            tournamentId: t._id,
            name,
            address: `${name} address`,
            surface_type: "other",
          },
        },
        { upsert: true, new: true }
      )
    )
  );

  // Timeslots: every day (0..6), each hour 15..21 => [15:00-16:00, ..., 21:00-22:00]
  const venues = [v1, v2, v3];
  for (const v of venues) {
    for (let dow = 0; dow <= 6; dow++) {
      for (let h = 15; h <= 21; h++) {
        await TimeslotModel.findOneAndUpdate(
          { venue_id: v._id, day_of_week: dow, start_time: `${HH(h)}:00` },
          {
            $setOnInsert: {
              venue_id: v._id,
              day_of_week: dow,
              start_time: `${HH(h)}:00`,
              end_time: `${HH(h + 1)}:00`,
              timezone: "America/Mexico_City",
              is_active: true,
              label: "",
            },
          },
          { upsert: true, new: true }
        );
      }
    }
  }

  // 30 teams, assign 3 groups of 10 (A,B,C)
  const groupIds = {
    A: new Types.ObjectId(),
    B: new Types.ObjectId(),
    C: new Types.ObjectId(),
  }; // no GroupModel required
  const existing = await TeamModel.find({ tournamentId: t._id }).lean();
  for (let i = existing.length + 1; i <= 30; i++) {
    const group = i <= 10 ? "A" : i <= 20 ? "B" : "C";
    await TeamModel.create({
      tournamentId: t._id,
      name: `G${group} Team ${HH(((i - 1) % 10) + 1)}`,
      manager: `g${group.toLowerCase()}-m${i}@example.com`,
      groupId: groupIds[group as "A" | "B" | "C"],
    });
  }
  if (existing.length < 30) {
    console.log(`Created ${30 - existing.length} teams (total now ≥ 30).`);
  } else {
    console.log(`Already had ${existing.length} teams.`);
  }

  return {
    tournamentId: new Types.ObjectId(t._id),
    startDate,
    endDate,
    groupIds,
  };
}

async function buildConcreteSlots(
  tournamentId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<ConcreteSlot[]> {
  const venues = await VenueModel.find({ tournamentId }).lean();
  const vset = new Set(venues.map((v) => v._id.toString()));
  const weekly = await TimeslotModel.find({ is_active: true }).lean();

  const out: ConcreteSlot[] = [];
  for (const s of weekly) {
    if (!vset.has(String(s.venue_id))) continue;
    const first = nextDow(startDate, s.day_of_week);
    for (let d = first; d <= endDate; d = addDays(d, 7)) {
      out.push({
        venueId: new Types.ObjectId(s.venue_id),
        dateISO: isoDate(d),
        start_time: s.start_time,
        end_time: s.end_time,
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

async function run() {
  await getConn();

  // Seed tournament, venues, timeslots, teams
  const { tournamentId, startDate, endDate, groupIds } = await seedTournament();

  // Map group → allowed DOW: A→Mon(1), B→Wed(3), C→Fri(5)
  const groupDay: Record<string, number> = {
    [groupIds.A.toString()]: 1,
    [groupIds.B.toString()]: 3,
    [groupIds.C.toString()]: 5,
  };

  // Load teams grouped
  const teams = await TeamModel.find({ tournamentId }).sort({ name: 1 }).lean();
  if (teams.length !== 30) {
    console.log(`Warning: expected 30 teams, found ${teams.length}`);
  }
  const byGroup = new Map<string, Types.ObjectId[]>();
  for (const t of teams) {
    const gid = String(t.groupId ?? groupIds.A);
    if (!byGroup.has(gid)) byGroup.set(gid, []);
    byGroup.get(gid)!.push(new Types.ObjectId(t._id));
  }

  // Generate pairings within each group (single round robin)
  const pairings: Pairing[] = [];
  for (const [gid, list] of byGroup) {
    const ps = generateRoundRobin(list, false).map((p) => ({
      ...p,
      groupId: new Types.ObjectId(gid),
    }));
    pairings.push(...ps);
  }

  // Idempotent pending matches (don’t set schedule fields)
  await MatchModel.bulkWrite(
    pairings.map((p) => ({
      updateOne: {
        filter: {
          tournamentId,
          round: p.round,
          leg: p.leg,
          homeTeamId: p.home,
          awayTeamId: p.away,
        },
        update: {
          $setOnInsert: {
            tournamentId,
            round: p.round,
            leg: p.leg,
            homeTeamId: p.home,
            awayTeamId: p.away,
            groupId: p.groupId,
            status: "pending",
          },
        },
        upsert: true,
      },
    }))
  );

  // Build all concrete slots
  const slots = await buildConcreteSlots(tournamentId, startDate, endDate);
  if (slots.length === 0) throw new Error("No concrete slots generated.");

  // Constraint sets
  const venueTimeUsed = new Set<string>();
  const teamAtTime = new Set<string>();
  const teamAtDay = new Set<string>(); // spread: one match per team per day

  // Seed context from already scheduled (reruns)
  const already = await MatchModel.find({
    tournamentId,
    date: { $exists: true },
  }).lean();
  for (const m of already) {
    const dISO = isoDate(new Date(m.date!));
    const vKey = `${m.venueId}-${dISO}-${m.start_time}`;
    venueTimeUsed.add(vKey);
    teamAtTime.add(`${m.homeTeamId}-${dISO}-${m.start_time}`);
    teamAtTime.add(`${m.awayTeamId}-${dISO}-${m.start_time}`);
    teamAtDay.add(`${m.homeTeamId}-${dISO}`);
    teamAtDay.add(`${m.awayTeamId}-${dISO}`);
  }

  // Only unscheduled
  const matches = await MatchModel.find({
    tournamentId,
    date: { $exists: false },
  })
    .sort({ round: 1, leg: 1, _id: 1 })
    .lean();

  let scheduled = 0;
  const conflicts: any[] = [];

  // Fast greedy with group-day constraint
  for (const m of matches) {
    // derive groupId (from match or from team)
    const mGroupId = (m as any).groupId
      ? String((m as any).groupId)
      : String(
          teams.find((t) => String(t._id) === String(m.homeTeamId))?.groupId ??
            groupIds.A
        );

    const allowedDow = groupDay[mGroupId];
    if (allowedDow == null) {
      // if unknown, mark conflict and continue
      await MatchModel.updateOne(
        { _id: m._id },
        { $set: { conflict_reason: "unknown group", status: "pending" } }
      );
      conflicts.push({ matchId: m._id, reason: "unknown group" });
      continue;
    }

    let placed = false;
    for (const s of slots) {
      // enforce group-day constraint
      const dow = new Date(`${s.dateISO}T00:00:00Z`).getUTCDay();
      if (dow !== allowedDow) continue;

      const vKey = `${s.venueId}-${s.dateISO}-${s.start_time}`;
      const aKey = `${m.homeTeamId}-${s.dateISO}-${s.start_time}`;
      const bKey = `${m.awayTeamId}-${s.dateISO}-${s.start_time}`;
      const aDay = `${m.homeTeamId}-${s.dateISO}`;
      const bDay = `${m.awayTeamId}-${s.dateISO}`;

      if (venueTimeUsed.has(vKey)) continue;
      if (teamAtTime.has(aKey) || teamAtTime.has(bKey)) continue; // no team overlap
      if (teamAtDay.has(aDay) || teamAtDay.has(bDay)) continue; // spread: 1/day

      // schedule
      await MatchModel.updateOne(
        { _id: m._id },
        {
          $set: {
            status: "scheduled",
            venueId: s.venueId,
            date: new Date(`${s.dateISO}T00:00:00.000Z`),
            start_time: s.start_time,
            end_time: s.end_time,
            groupId: new Types.ObjectId(mGroupId),
          },
        }
      );

      venueTimeUsed.add(vKey);
      teamAtTime.add(aKey);
      teamAtTime.add(bKey);
      teamAtDay.add(aDay);
      teamAtDay.add(bDay);

      scheduled++;
      placed = true;
      break;
    }

    if (!placed) {
      await MatchModel.updateOne(
        { _id: m._id },
        { $set: { conflict_reason: "no slot (group-day)", status: "pending" } }
      );
      conflicts.push({
        matchId: m._id,
        home: m.homeTeamId,
        away: m.awayTeamId,
        groupId: mGroupId,
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        scheduled,
        conflicts: conflicts.length,
        conflict_samples: conflicts.slice(0, 10),
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
