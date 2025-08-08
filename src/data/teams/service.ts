// data/teams/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TeamSchema, TeamModel } from "@/data/teams/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";

/* Write-safe schema */
const WriteTeam = TeamSchema.omit({
  _id: true,
});

/* Action-state shape */
export type State = {
  errors?: { tournamentID?: string[]; name?: string[]; manager?: string[] };
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

  revalidatePath("/dashboard/teams");
  redirect("/dashboard/teams");
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllTeams() {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return TeamModel.find().sort({ name: 1 }).lean();
}

export async function fetchTeamById(id: string) {
  /* throws if not a valid ObjectId */
  zObjectId.parse(id);
  await getConn();
  return TeamModel.findById(id).lean();
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateTeam(
  id: string,
  prevState: State,
  formData: FormData
) {
  const idCheck = zObjectId.safeParse(formData.get("id"));

  const validatedFields = WriteTeam.safeParse({
    tournamentId: formData.get("tournamentId"),
    name: formData.get("name"),
    manager: formData.get("manager"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Team.",
    };
  }

  try {
    await getConn();
    await TeamModel.findByIdAndUpdate(idCheck.data, validatedFields.data, {
      runValidators: true,
      new: false,
    });
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Update Team." };
  }

  revalidatePath("/dashboard/Teams");
  redirect("/dashboard/Teams");
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deleteTeam(id: string) {
  const idCheck = zObjectId.safeParse(id);

  if (!idCheck.success) {
    return { errors: { id: ["Invalid id"] }, message: "Invalid id." };
  }

  try {
    await getConn();
    await TeamModel.findByIdAndDelete(idCheck.data);
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Delete Team" };
  }

  revalidatePath("/dashboard/teams");
  /* stay on same page after deletion */
  return {};
}
