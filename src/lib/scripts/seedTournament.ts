// lib/seed/seedTournament.ts
import { Types } from "mongoose";
import { addDays } from "date-fns";
import { TournamentModel } from "@/data/tournaments/schema";
import { TeamModel } from "@/data/teams/schema";
import { VenueModel } from "@/data/venues/schema";
import { GroupModel } from "@/data/groups/schema";
import { TimeslotModel } from "@/data/timeslots/schema";
import { nextDow } from "@/lib/scheduling/slots";

export type SeedTournamentResult = {
  tournamentId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
};

export async function seedTournament(
  doubleRoundRobin = false
): Promise<SeedTournamentResult> {
  // 1) Tournament window: next Monday → +10 weeks (same as original)
  const now = new Date();
  const startDate = nextDow(now, 1); // 1 = Monday
  const endDate = addDays(startDate, 7 * 10);

  const ownerId = new Types.ObjectId();
  const name = "Demo League 3 (SeededGroups)";

  let tournament = await TournamentModel.findOne({ name }).lean();
  if (!tournament) {
    tournament = (
      await TournamentModel.create({
        name,
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
    console.log(`Created tournament: ${tournament._id}`);
  } else {
    console.log(`Using existing tournament: ${tournament._id}`);
  }

  // 2) Venues
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

  // 3) Weekly timeslots: Mon–Sat, 3 × 1h slots from 15:00 to 18:00 on BOTH venues
  const DAYS = [1, 2, 3, 4, 5, 6]; // 1=Mon ... 6=Sat  (keep your 0..6 mapping)
  const SLOTS = [
    { start_time: "15:00", end_time: "16:00" },
    { start_time: "16:00", end_time: "17:00" },
    { start_time: "17:00", end_time: "18:00" },
  ];

  async function ensureTimeslotsForVenue(venueId: Types.ObjectId) {
    for (const day_of_week of DAYS) {
      for (const slot of SLOTS) {
        await TimeslotModel.findOneAndUpdate(
          { venue_id: venueId, day_of_week, start_time: slot.start_time },
          {
            $setOnInsert: {
              venue_id: venueId,
              day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
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

  // apply to both venues
  await Promise.all([
    ensureTimeslotsForVenue(vn._id),
    ensureTimeslotsForVenue(vs._id),
  ]);

  // 4) Groups & Teams: 4 groups × 4 teams each; each group limited to one DOW
  // DOW mapping: 1=Mon, 2=Tue, 3=Wed, 4=Thu  (adjust as you wish)
  const groupDefs = [
    { name: "Group A", slug: "a", dow: 1 }, // Monday
    { name: "Group B", slug: "b", dow: 3 }, // Tuesday
    { name: "Group C", slug: "c", dow: 5 }, // Wednesday
    { name: "Group D", slug: "d", dow: 6 }, // Saturday
  ];

  // Ensure groups exist with availability (only their DOW allowed)
  const groupsCreated: Array<{
    _id: Types.ObjectId;
    name: string;
    slug: string;
    dow: number;
  }> = [];
  for (const def of groupDefs) {
    const allowedObj: Record<string, Array<{ start: string; end: string }>> = {
      [String(def.dow)]: [{ start: "00:00", end: "23:59" }], // any time that day
    };

    const g = await GroupModel.findOneAndUpdate(
      { tournamentId: tournament._id, name: def.name },
      {
        $setOnInsert: {
          tournamentId: tournament._id,
          name: def.name,
          slug: def.slug,
          availability: { allowed: allowedObj, preferredStarts: [] },
        },
      },
      { upsert: true, new: true }
    );

    groupsCreated.push({
      _id: g._id as Types.ObjectId,
      name: def.name,
      slug: def.slug,
      dow: def.dow,
    });
  }

  // For each group, ensure exactly 4 teams exist; assign groupId and copy availability
  for (const g of groupsCreated) {
    const have = await TeamModel.countDocuments({
      tournamentId: tournament._id,
      groupId: g._id,
    });

    // Copy group's availability into each team so scheduling constraints can read it
    const allowedObj: Record<string, Array<{ start: string; end: string }>> = {
      [String(g.dow)]: [{ start: "00:00", end: "23:59" }],
    };

    for (let n = have + 1; n <= 4; n++) {
      // Team names stay unique per tournament due to (tournamentId, name) unique index.
      await TeamModel.create({
        tournamentId: tournament._id,
        groupId: g._id,
        name: `Team ${g.slug.toUpperCase()}-${n}`, // e.g., Team A-1
        manager: `manager_${g.slug}${n}@example.com`,
        availability: { allowed: allowedObj, preferredStarts: [] },
      });
    }
    if (have < 4) {
      console.log(`Created ${4 - have} team(s) for ${g.name}.`);
    } else {
      console.log(`${g.name} already has ${have} team(s).`);
    }
  }

  // Optional: if this is the first time you seed, ensure groups are actually used by the scheduler
  await TournamentModel.updateOne(
    { _id: tournament._id },
    {
      $set: { "settings.groupsEnabled": true, "settings.groupsMode": "manual" },
    }
  );

  return {
    tournamentId: new Types.ObjectId(tournament._id),
    startDate,
    endDate,
  };
}
