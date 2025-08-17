// data/matches/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MatchSchema, MatchModel, Match } from "@/data/matches/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";
import { ActionResult } from "@/data/_helpers";

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
