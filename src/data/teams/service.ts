// data/teams/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TeamSchema, TeamModel, Team } from "@/data/teams/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";

/* Write-safe schema */
const WriteTeam = TeamSchema.omit({
  _id: true,
});

/* Action-state shape */
export type State = {
  errors?: { tournamentId?: string[]; name?: string[]; manager?: string[] };
  message?: string | null;
};

/* ════════════════  C R E A T E  ════════════════ */

export async function createTeam(prevState: State, formData: FormData) {
  const validatedFields = WriteTeam.safeParse({
    tournamentId: formData.get("tournamentId"),
    name: formData.get("name"),
    manager: formData.get("manager"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Team.",
    };
  }

  try {
    await getConn();
    await TeamModel.create(validatedFields.data);
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Create Team." };
  }

  // Use the tid from the form for both revalidation + redirect
  const tid = validatedFields.data.tournamentId;

  revalidatePath(`/tournament/${tid}/teams`);
  redirect(`/tournament/${tid}/teams`);
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllTeams() {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return TeamModel.find().sort({ name: 1 }).lean();
}

export async function fetchTeamById(id: string): Promise<Team | null> {
  /* throws if not a valid ObjectId */
  if (!id) throw new Error("Missing route param id");
  zObjectId.parse(id);
  await getConn();
  return TeamModel.findById(id).lean<Team>().exec();
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateTeam(prevState: State, formData: FormData) {
  const raw = Object.fromEntries(formData);

  const validatedFields = TeamSchema.safeParse(raw);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Team.",
    };
  }

  const { _id, tournamentId, name, manager } = validatedFields.data;

  try {
    await getConn();
    await TeamModel.findByIdAndUpdate(
      _id,
      { tournamentId, name, manager },
      {
        runValidators: true,
        new: false,
      }
    );
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Update Team." };
  }

  revalidatePath(`/tournament/${tournamentId}/teams`);
  redirect(`/tournament/${tournamentId}/teams`);
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deleteTeam(id: string) {
  const idCheck = zObjectId.safeParse(id);
  if (!idCheck.success)
    return { errors: { id: ["Invalid id"] }, message: "Invalid id." };

  await getConn();

  // Mongoose: return the deleted doc so we can read tournamentId
  const deleted = await TeamModel.findOneAndDelete(
    { _id: idCheck.data },
    { projection: { tournamentId: 1 } as any } // or `.select('tournamentId')` on older Mongoose
  );

  const tid = deleted?.tournamentId?.toString();
  if (tid) revalidatePath(`/tournament/${tid}/teams`);

  return {};
}
