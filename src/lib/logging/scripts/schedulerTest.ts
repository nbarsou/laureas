/* Minimal seed + schedule script
   Usage:
     pnpm ts-node --project tsconfig.json scripts/run-scheduler.ts [--double] [--mode=spread|compressed]
*/

import "dotenv/config";
import mongoose, { Types } from "mongoose";
import { addDays, startOfDay } from "date-fns";

// Adjust these imports to your project structure:
import { getConn } from "@/data/db";
import { TournamentModel } from "@/data/tournaments/schema";
import { TeamModel } from "@/data/teams/schema";
import { MatchModel } from "@/data/matches/schema";
import { VenueModel } from "@/data/venues/schema";
import { TimeslotModel } from "@/data/timeslots/schema";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

type Pairing = {
  round: number;
  leg: number;
  home: Types.ObjectId;
  away: Types.ObjectId;
};

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
    // rotate (keep left[0] fixed)
    const fixed = left[0];
    const movedFromLeft = left.pop()!;
    left = [fixed, right[0], ...left.slice(1)];
    right = right.slice(1).concat(movedFromLeft);
  }
  return pairs;
}

type ConcreteSlot = {
  venueId: Types.ObjectId;
  dateISO: string; // 'YYYY-MM-DD'
  start_time: string;
  end_time: string;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type SeedTournamentResult = {
  tournamentId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
};

async function seedTournament(double: boolean): Promise<SeedTournamentResult> {
  // 1) Tournament window: next Monday → +6 weeks
  const now = new Date();
  const startDate = nextDow(now, 1); // 1 = Monday
  const endDate = addDays(startDate, 7 * 6); // 6 weeks

  // Owner is required by schema; a random ObjectId works if you don’t enforce FK.
  const ownerId = new Types.ObjectId();

  // Upsert the tournament by name (idempotent for reruns)
  const tName = "Demo League (Seeded)";
  let tournament = await TournamentModel.findOne({ name: tName }).lean();
  if (!tournament) {
    tournament = (
      await TournamentModel.create({
        name: tName,
        ownerId,
        startDate,
        endDate,
        settings: {
          schedulerMode: "compressed",
          doubleRoundRobin: double,
          minGapMinutesSameDay: 60,
          maxBacktracks: 400,
          balancePreferredStarts: true,
          allowSameDayDoubleHeader: true,
          groupsEnabled: false,
          groupsMode: "manual",
        },
      })
    ).toObject();

    if (!tournament) {
      console.log("Unable to create tournament");
      throw new Error("Seeding failed");
    }

    console.log(`Created tournament: ${tournament._id}`);
  } else {
    console.log(`Using existing tournament: ${tournament._id}`);
  }

  // 2) Venues: two basic arenas
  const [vn, vs] = await Promise.all([
    VenueModel.findOneAndUpdate(
      { tournamentId: tournament._id, name: "Arena Norte" },
      {
        $setOnInsert: {
          tournamentId: tournament._id,
          name: "Arena Norte",
          address: "Norte 123",
          surface_type: "other",
        },
      },
      { upsert: true, new: true }
    ),
    VenueModel.findOneAndUpdate(
      { tournamentId: tournament._id, name: "Arena Sur" },
      {
        $setOnInsert: {
          tournamentId: tournament._id,
          name: "Arena Sur",
          address: "Sur 456",
          surface_type: "other",
        },
      },
      { upsert: true, new: true }
    ),
  ]);

  // 3) Timeslots per venue: Mon 17:00–18:00, Wed 19:00–20:00
  const slotsToEnsure = [
    {
      venue_id: vn._id,
      day_of_week: 1,
      start_time: "17:00",
      end_time: "18:00",
    }, // Mon
    {
      venue_id: vn._id,
      day_of_week: 3,
      start_time: "19:00",
      end_time: "20:00",
    }, // Wed
    {
      venue_id: vs._id,
      day_of_week: 1,
      start_time: "17:00",
      end_time: "18:00",
    }, // Mon
    {
      venue_id: vs._id,
      day_of_week: 3,
      start_time: "19:00",
      end_time: "20:00",
    }, // Wed
  ];
  for (const s of slotsToEnsure) {
    await TimeslotModel.findOneAndUpdate(
      {
        venue_id: s.venue_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
      },
      {
        $setOnInsert: {
          ...s,
          timezone: "America/Mexico_City",
          is_active: true,
          label: "",
        },
      },
      { upsert: true, new: true }
    );
  }

  // 4) Teams: Team 1..10
  const wanted = 10;
  const existing = await TeamModel.find({
    tournamentId: tournament._id,
  }).lean();
  for (let i = existing.length + 1; i <= wanted; i++) {
    await TeamModel.create({
      tournamentId: tournament._id,
      name: `Team ${i}`,
      manager: `manager${i}@example.com`,
    });
  }
  if (existing.length < wanted) {
    console.log(
      `Created ${wanted - existing.length} teams (total now ≥ ${wanted}).`
    );
  } else {
    console.log(`Already had ${existing.length} teams.`);
  }

  return {
    tournamentId: new Types.ObjectId(tournament._id),
    startDate,
    endDate,
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
    if (!vset.has(s.venue_id.toString())) continue;
    // expand weekly occurrence within tournament window
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
  // sort by date and time
  out.sort(
    (a, b) =>
      a.dateISO.localeCompare(b.dateISO) ||
      a.start_time.localeCompare(b.start_time)
  );
  return out;
}

async function run() {
  // flags
  const args = new Map(
    process.argv.slice(2).map((s) => {
      const [k, v] = s.startsWith("--") ? s.slice(2).split("=") : [s, "true"];
      return [k, v ?? "true"];
    })
  );
  const double = args.has("double");
  const mode = (args.get("mode") === "spread" ? "spread" : "compressed") as
    | "spread"
    | "compressed";

  await getConn();

  // seed
  const { tournamentId, startDate, endDate } = await seedTournament(double);

  // load teams
  const teams = await TeamModel.find({ tournamentId }).sort({ name: 1 }).lean();
  if (teams.length < 2) throw new Error("Need at least 2 teams.");

  // (re)generate pending matches if none
  const pending = await MatchModel.countDocuments({
    tournamentId,
    date: { $exists: false },
  });
  if (pending === 0) {
    const pairs = generateRoundRobin(
      teams.map((t) => new Types.ObjectId(t._id)),
      double
    );
    await MatchModel.insertMany(
      pairs.map((p) => ({
        tournamentId,
        round: p.round,
        leg: p.leg,
        homeTeamId: p.home,
        awayTeamId: p.away,
        status: "pending",
      }))
    );
    console.log(`Generated ${pairs.length} matches`);
  } else {
    console.log(`Found ${pending} pending matches to schedule`);
  }

  // concrete slots
  const slots = await buildConcreteSlots(tournamentId, startDate, endDate);
  if (slots.length === 0)
    throw new Error("No concrete slots generated—check timeslots and dates.");
  console.log(`Concrete slots: ${slots.length}`);

  // fast greedy assign
  const venueTimeUsed = new Set<string>(); // `${venueId}-${dateISO}-${start}`
  const teamAtTime = new Set<string>(); // `${teamId}-${dateISO}-${start}`
  const teamAtDay = new Set<string>(); // `${teamId}-${dateISO}` (spread mode)

  // seed from already scheduled (if rerun)
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
    if (mode === "spread") {
      teamAtDay.add(`${m.homeTeamId}-${dISO}`);
      teamAtDay.add(`${m.awayTeamId}-${dISO}`);
    }
  }

  const matches = await MatchModel.find({
    tournamentId,
    date: { $exists: false },
  })
    .sort({ round: 1, leg: 1, _id: 1 })
    .lean();

  let scheduled = 0;
  const conflicts: any[] = [];

  for (const m of matches) {
    let placed = false;
    for (const s of slots) {
      const vKey = `${s.venueId}-${s.dateISO}-${s.start_time}`;
      const aKey = `${m.homeTeamId}-${s.dateISO}-${s.start_time}`;
      const bKey = `${m.awayTeamId}-${s.dateISO}-${s.start_time}`;
      const aDay = `${m.homeTeamId}-${s.dateISO}`;
      const bDay = `${m.awayTeamId}-${s.dateISO}`;

      if (venueTimeUsed.has(vKey)) continue;
      if (teamAtTime.has(aKey) || teamAtTime.has(bKey)) continue;
      if (mode === "spread" && (teamAtDay.has(aDay) || teamAtDay.has(bDay)))
        continue;

      await MatchModel.updateOne(
        { _id: m._id },
        {
          $set: {
            venueId: s.venueId,
            date: new Date(`${s.dateISO}T00:00:00.000Z`),
            start_time: s.start_time,
            end_time: s.end_time,
            status: "scheduled",
          },
        }
      );

      venueTimeUsed.add(vKey);
      teamAtTime.add(aKey);
      teamAtTime.add(bKey);
      if (mode === "spread") {
        teamAtDay.add(aDay);
        teamAtDay.add(bDay);
      }

      scheduled++;
      placed = true;
      break;
    }
    if (!placed) {
      await MatchModel.updateOne(
        { _id: m._id },
        { $set: { conflict_reason: "no slot", status: "pending" } }
      );
      conflicts.push({
        matchId: m._id,
        home: m.homeTeamId,
        away: m.awayTeamId,
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
