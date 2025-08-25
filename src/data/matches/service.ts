// data/matches/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MatchSchema, MatchModel, Match } from "@/data/matches/schema";
import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";
import { ActionResult } from "@/data/_helpers";
import { Types } from "mongoose";

/* Write-safe schema */
const WriteMatch = MatchSchema.omit({ _id: true });

/* Action-state shape */
export type State = {
  errors?: {
    tournamentId?: string[];
    round?: string[];
    homeTeamId?: string[];
    awayTeamId?: string[];
    score?: string[];
  };
  message?: string | null;
};
// TODO: Validate the score insert?
// TODO: Do i really need this way of manually creating a match?
// TODO: Convert to server generate functions.
/* ════════════════  C R E A T E  ════════════════ */

export async function createMatch(
  prevState: State,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = WriteMatch.safeParse({
    tournamentId: formData.get("tournamentId"),
    round: formData.get("round"),
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    /* score field arrives as JSON string  ➜  { home: 2, away: 1 } */
    score: formData.get("score")
      ? JSON.parse(String(formData.get("score")))
      : undefined,
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Match.",
    };
  }

  try {
    await getConn();
    await MatchModel.create(validatedFields.data);
  } catch (error: any) {
    logger.error(error);
    return { ok: false, message: "Database Error: Failed to Create Match." };
  }

  revalidatePath("/tournament/matches");
  redirect("/tournament/matches");
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllMatches(): Promise<Match[]> {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return MatchModel.find().sort({ name: 1 }).lean<Match[]>();
}

export async function fetchMatchById(id: string): Promise<Match | null> {
  /* throws if not a valid ObjectId */
  zObjectId.parse(id);
  await getConn();
  return MatchModel.findById(id).lean<Match>();
}

export type HydratedMatch = {
  _id: string;
  tournamentId: string;
  group?: { _id: string; name: string } | null;
  round: number;
  leg: number;
  date?: string | null; // ISO
  start_time?: string | null; // HH:MM
  end_time?: string | null; // HH:MM
  status: "pending" | "scheduled" | "completed" | "canceled";
  conflict_reason?: string | null;
  venue?: { _id: string; name: string } | null;
  homeTeam: { _id: string; name: string };
  awayTeam: { _id: string; name: string };
  score?: { home?: number | null; away?: number | null };
  updatedAt?: string;
  createdAt?: string;
};

export async function fetchMatchesByTournamentIdHydrated(
  tournamentId: string
): Promise<HydratedMatch[]> {
  const tid = new Types.ObjectId(tournamentId);

  const rows = await MatchModel.aggregate([
    {
      $match: {
        tournamentId: tid,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
    },

    // home team (include groupId!)
    {
      $lookup: {
        from: "teams",
        localField: "homeTeamId",
        foreignField: "_id",
        as: "homeTeam",
        pipeline: [{ $project: { _id: 1, name: 1, groupId: 1 } }],
      },
    },
    { $unwind: "$homeTeam" },

    // away team (include groupId!)
    {
      $lookup: {
        from: "teams",
        localField: "awayTeamId",
        foreignField: "_id",
        as: "awayTeam",
        pipeline: [{ $project: { _id: 1, name: 1, groupId: 1 } }],
      },
    },
    { $unwind: "$awayTeam" },

    // Compute an effective groupId (prefer match.groupId, else homeTeam.groupId, else awayTeam.groupId)
    {
      $addFields: {
        _effectiveGroupId: {
          $ifNull: [
            "$groupId",
            {
              $ifNull: ["$homeTeam.groupId", "$awayTeam.groupId"],
            },
          ],
        },
      },
    },

    // group (optional) using the computed id
    {
      $lookup: {
        from: "groups",
        localField: "_effectiveGroupId",
        foreignField: "_id",
        as: "group",
        pipeline: [{ $project: { _id: 1, name: 1 } }],
      },
    },
    { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },

    // venue (optional)
    {
      $lookup: {
        from: "venues",
        localField: "venueId",
        foreignField: "_id",
        as: "venue",
        pipeline: [{ $project: { _id: 1, name: 1 } }],
      },
    },
    { $unwind: { path: "$venue", preserveNullAndEmptyArrays: true } },

    // shape output
    {
      $project: {
        _id: { $toString: "$_id" },
        tournamentId: { $toString: "$tournamentId" },
        round: 1,
        leg: 1,
        date: 1,
        start_time: 1,
        end_time: 1,
        status: 1,
        conflict_reason: 1,
        score: 1,
        updatedAt: 1,
        createdAt: 1,
        homeTeam: {
          _id: { $toString: "$homeTeam._id" },
          name: "$homeTeam.name",
        },
        awayTeam: {
          _id: { $toString: "$awayTeam._id" },
          name: "$awayTeam.name",
        },
        group: {
          $cond: [
            { $ifNull: ["$group", false] },
            { _id: { $toString: "$group._id" }, name: "$group.name" },
            null,
          ],
        },
        venue: {
          $cond: [
            { $ifNull: ["$venue", false] },
            { _id: { $toString: "$venue._id" }, name: "$venue.name" },
            null,
          ],
        },
      },
    },

    // sensible default ordering
    {
      $sort: {
        date: 1,
        "venue.name": 1,
        start_time: 1,
        round: 1,
        leg: 1,
        "homeTeam.name": 1,
      },
    },
  ]).exec();

  return rows as HydratedMatch[];
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateMatch(
  id: string,
  prevState: State,
  formData: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(formData.get("id"));

  const validatedFields = WriteMatch.safeParse({
    tournamentId: formData.get("tournamentId"),
    round: formData.get("round"),
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    /* score field arrives as JSON string  ➜  { home: 2, away: 1 } */
    score: formData.get("score")
      ? JSON.parse(String(formData.get("score")))
      : undefined,
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Match.",
    };
  }

  try {
    await getConn();
    await MatchModel.findByIdAndUpdate(idCheck.data, validatedFields.data, {
      runValidators: true,
      new: false,
    });
  } catch (error: any) {
    logger.error(error);
    return { ok: false, message: "Database Error: Failed to Update Match." };
  }

  revalidatePath("/tournament/matches");
  redirect("/tournament/matches");
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deleteMatch(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);

  if (!idCheck.success) {
    return {
      ok: false,
      errors: { id: ["Invalid id"] },
      message: "Invalid id.",
    };
  }

  try {
    await getConn();
    await MatchModel.findByIdAndDelete(idCheck.data);
  } catch (error: any) {
    logger.error(error);
    return { ok: false, message: "Database Error: Failed to Delete Match" };
  }

  revalidatePath("/tournament/matches");
  /* stay on same page after deletion */
  return { ok: true };
}
