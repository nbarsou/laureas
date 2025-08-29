// lib/seed/seedTournament.ts
import { Types } from "mongoose";
import { faker } from "@faker-js/faker";
import { getConn } from "@/lib/db";

// ---- EDIT THESE IMPORT PATHS TO MATCH YOUR APP ----
import { TournamentModel } from "@/data/tournaments/model";
import { GroupModel } from "@/data/groups/model";
import { TeamModel } from "@/data/teams/model";
import { MatchModel } from "@/data/matches/model";
import { VenueModel } from "@/data/venues/model";
import { TimeslotModel } from "@/data/timeslots/model";
// Optional Player model (if you have one). Safe to remove if not needed.
let Player: any | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Player = require("@/models/Player").default ?? require("@/models/Player");
} catch {
  Player = null;
}

type SeedOptions = {
  ownerId: string; // existing User _id
  tournamentName?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  groups?: number;
  teamsPerGroup?: number;
  playersPerTeam?: number;
  createPlayers?: boolean;
  doubleRound?: boolean;
  allowSameDayPlay?: boolean;
};

const hhmm = (h: number, m: number) =>
  `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

function roundRobinPairings(teamIds: Types.ObjectId[], doubleRound: boolean) {
  // Circle method
  const ids: (Types.ObjectId | null)[] = [...teamIds];
  if (ids.length % 2 === 1) ids.push(null);
  const n = ids.length;
  const rounds = n - 1;
  const schedule: {
    round: number;
    home: Types.ObjectId;
    away: Types.ObjectId;
    leg: 1 | 2;
  }[][] = [];

  for (let r = 0; r < rounds; r++) {
    const matches: {
      round: number;
      home: Types.ObjectId;
      away: Types.ObjectId;
      leg: 1 | 2;
    }[] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = ids[i];
      const away = ids[n - 1 - i];
      if (home && away) matches.push({ round: r + 1, home, away, leg: 1 });
    }
    schedule.push(matches);
    // rotate (keep first fixed)
    const fixed = ids[0]!;
    const rest = ids.slice(1);
    rest.unshift(rest.pop()!);
    ids.splice(0, ids.length, fixed, ...rest);
  }

  if (!doubleRound) return schedule;
  const secondLeg = schedule.map((matches, idx) =>
    matches.map((m) => ({
      round: rounds + idx + 1,
      home: m.away,
      away: m.home,
      leg: 2 as const,
    }))
  );
  return schedule.concat(secondLeg);
}

type Slot = {
  venue_id: Types.ObjectId;
  day_of_week: number; // 0-6
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
};

function* dateTimesFromTimeslots(
  timeslots: Slot[],
  startDate: Date,
  endDate: Date
): Generator<{
  date: Date;
  start_time: string;
  end_time: string;
  venueId: Types.ObjectId;
}> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (
    let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    d <= end;

  ) {
    const dow = d.getDay();
    for (const ts of timeslots) {
      if (ts.day_of_week === dow) {
        yield {
          date: new Date(d),
          start_time: ts.start_time,
          end_time: ts.end_time,
          venueId: ts.venue_id,
        };
      }
    }
    d.setDate(d.getDate() + 1);
  }
}

function nextEmail(domain = "clubmail.com") {
  return faker.internet.email({ provider: domain }).toLowerCase();
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function seedTournament(opts: SeedOptions) {
  const {
    ownerId = new Types.ObjectId(),
    tournamentName = `Demo Cup ${new Date().getFullYear()}`,
    startDate = new Date(),
    endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 35), // +5 weeks
    groups = 4,
    teamsPerGroup = 4,
    playersPerTeam = 8,
    createPlayers = true,
    doubleRound = false,
    allowSameDayPlay = false,
  } = opts;

  if (!ownerId) throw new Error("ownerId is required");

  // Ensure a single shared connection using your helper
  await getConn();

  // 1) Tournament
  const tournament = await TournamentModel.create({
    name: tournamentName,
    ownerId: new Types.ObjectId(ownerId),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    roundRobinDouble: doubleRound,
    allowSameDayPlay,
    groupsEnabled: true,
  });

  // 2) Venues + Timeslots (customize as you like)
  const venues = await VenueModel.insertMany([
    {
      tournamentId: tournament._id,
      name: "Main Park Field",
      address: "123 Greenway, City",
      surface_type: "grass",
    },
    {
      tournamentId: tournament._id,
      name: "Indoor Arena",
      address: "500 Center Ave, City",
      surface_type: "indoor",
    },
  ]);

  const timeslots = await TimeslotModel.insertMany([
    {
      venue_id: venues[0]._id,
      day_of_week: 6, // Sat
      start_time: hhmm(10, 0),
      end_time: hhmm(11, 30),
      timezone: "America/Mexico_City",
      label: "Saturday Morning",
    },
    {
      venue_id: venues[0]._id,
      day_of_week: 0, // Sun
      start_time: hhmm(12, 0),
      end_time: hhmm(13, 30),
      timezone: "America/Mexico_City",
      label: "Sunday Noon",
    },
    {
      venue_id: venues[1]._id,
      day_of_week: 3, // Wed
      start_time: hhmm(19, 0),
      end_time: hhmm(20, 30),
      timezone: "America/Mexico_City",
      label: "Wednesday Night",
    },
  ]);

  // 3) Groups
  const groupDocs = await GroupModel.insertMany(
    Array.from({ length: groups }, (_, i) => ({
      tournamentId: tournament._id,
      name: `Group ${String.fromCharCode(65 + i)}`,
    }))
  );

  // 4) Teams
  const allTeams: Array<InstanceType<typeof TeamModel>> = [];
  for (const g of groupDocs) {
    const teams = await TeamModel.insertMany(
      Array.from({ length: teamsPerGroup }, () => {
        const city = faker.location.city();
        const animal = faker.animal.type();
        const name = `${city} ${animal}s`;
        return {
          tournamentId: tournament._id,
          groupId: g._id,
          name,
          manager: nextEmail(),
        };
      })
    );
    allTeams.push(...(teams as any));
  }

  // 5) Players (optional; safe no-op if you don’t have a Player model)
  if (createPlayers && Player) {
    const players: any[] = [];
    for (const team of allTeams) {
      for (let i = 0; i < playersPerTeam; i++) {
        const first = faker.person.firstName();
        const last = faker.person.lastName();
        players.push({
          teamId: team._id,
          tournamentId: tournament._id,
          name: `${first} ${last}`,
          email: nextEmail("players.test"),
          number: faker.number.int({ min: 1, max: 99 }),
        });
      }
    }
    try {
      await Player.insertMany(players);
    } catch (e: any) {
      // If your Player schema differs, comment this block or adjust fields
      // eslint-disable-next-line no-console
      console.warn("Skipping player creation:", e?.message ?? e);
    }
  }

  // 6) Round-robin schedule per group
  const matchesToCreate: any[] = [];
  for (const g of groupDocs) {
    const teamsInGroup = allTeams.filter(
      (t) => String(t.groupId) === String(g._id)
    );
    const teamIds = teamsInGroup.map((t) => t._id);
    const schedule = roundRobinPairings(teamIds, doubleRound);
    for (const round of schedule) {
      for (const m of round) {
        matchesToCreate.push({
          tournamentId: tournament._id,
          groupId: g._id,
          round: m.round,
          leg: m.leg,
          homeTeamId: m.home,
          awayTeamId: m.away,
          status: "scheduled",
        });
      }
    }
  }

  // 7) Assign dates/venues using existing timeslots
  const tsWithVenue = await TimeslotModel.find({
    venue_id: { $in: venues.map((v) => v._id) },
  }).lean();
  const slotIter = dateTimesFromTimeslots(
    tsWithVenue as unknown as Slot[],
    new Date(tournament.startDate),
    new Date(tournament.endDate)
  );

  const assignedByDay = new Map<string, Set<string>>();
  const markPlaced = (
    date: Date,
    home: Types.ObjectId,
    away: Types.ObjectId
  ) => {
    const key = dayKey(date);
    if (!assignedByDay.has(key)) assignedByDay.set(key, new Set());
    assignedByDay.get(key)!.add(String(home));
    assignedByDay.get(key)!.add(String(away));
  };
  const canPlace = (date: Date, home: Types.ObjectId, away: Types.ObjectId) => {
    if (allowSameDayPlay) return true;
    const key = dayKey(date);
    const set = assignedByDay.get(key);
    if (!set) return true;
    return !(set.has(String(home)) || set.has(String(away)));
  };

  for (const match of matchesToCreate) {
    let placed = false;
    while (true) {
      const slot = slotIter.next().value as
        | {
            date: Date;
            start_time: string;
            end_time: string;
            venueId: Types.ObjectId;
          }
        | undefined;
      if (!slot) break;

      if (!canPlace(slot.date, match.homeTeamId, match.awayTeamId)) continue;

      match.date = slot.date;
      match.start_time = slot.start_time; // matches your HH:MM pattern
      match.end_time = slot.end_time;
      match.venueId = slot.venueId;
      markPlaced(slot.date, match.homeTeamId, match.awayTeamId);
      placed = true;
      break;
    }

    // Fallback placement if we run out of configured timeslots
    if (!placed) {
      const lastDate =
        matchesToCreate
          .filter((m) => m.date)
          .map((m) => m.date as Date)
          .sort((a, b) => a.getTime() - b.getTime())
          .pop() ?? new Date(tournament.startDate);

      const fallback = new Date(lastDate);
      fallback.setDate(fallback.getDate() + 1);
      match.date = fallback;
      match.start_time = hhmm(18, 0);
      match.end_time = hhmm(19, 30);
      match.venueId = venues[0]._id;
      if (!allowSameDayPlay)
        markPlaced(fallback, match.homeTeamId, match.awayTeamId);
    }
  }

  // 8) Randomly mark ~30% as completed with fake scores
  for (const m of matchesToCreate) {
    if (Math.random() < 0.3) {
      m.status = "completed";
      m.homeScore = faker.number.int({ min: 0, max: 5 });
      m.awayScore = faker.number.int({ min: 0, max: 5 });
    }
  }

  const createdMatches = await MatchModel.insertMany(matchesToCreate);

  return {
    tournamentId: String(tournament._id),
    groups: groupDocs.length,
    teams: allTeams.length,
    matches: createdMatches.length,
    venues: venues.length,
    timeslots: timeslots.length,
  };
}
