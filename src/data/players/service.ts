// data/players/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PlayerSchema, PlayerModel } from "@/data/players/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";

/* Write-safe schema */
const WritePlayer = PlayerSchema.omit({ _id: true });

/* Action-state shape */
export type State = {
  errors?: {
    teamId?: string[];
    firstName?: string[];
    lastName?: string[];
    number?: string[];
  };
  message?: string | null;
};

/* ════════════════  C R E A T E  ════════════════ */

export async function createPlayer(prevState: State, formData: FormData) {
  const validatedFields = WritePlayer.safeParse({
    teamId: formData.get("teamId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    number: formData.get("number"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Player.",
    };
  }

  try {
    await getConn();
    await PlayerModel.create(validatedFields.data);
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Create Player." };
  }

  revalidatePath("/dashboard/players");
  redirect("/dashboard/players");
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllPlayers() {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return PlayerModel.find().sort({ name: 1 }).lean();
}

export async function fetchPlayerById(id: string) {
  /* throws if not a valid ObjectId */
  zObjectId.parse(id);
  await getConn();
  return PlayerModel.findById(id).lean();
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updatePlayer(
  id: string,
  prevState: State,
  formData: FormData
) {
  const idCheck = zObjectId.safeParse(formData.get("id"));

  const validatedFields = WritePlayer.safeParse({
    teamId: formData.get("teamId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    number: formData.get("number"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Player.",
    };
  }

  try {
    await getConn();
    await PlayerModel.findByIdAndUpdate(idCheck.data, validatedFields.data, {
      runValidators: true,
      new: false,
    });
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Update Player." };
  }

  revalidatePath("/dashboard/players");
  redirect("/dashboard/players");
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deletePlayer(id: string) {
  const idCheck = zObjectId.safeParse(id);

  if (!idCheck.success) {
    return { errors: { id: ["Invalid id"] }, message: "Invalid id." };
  }

  try {
    await getConn();
    await PlayerModel.findByIdAndDelete(idCheck.data);
  } catch (error: any) {
    logger.error(error);
    return { message: "Database Error: Failed to Delete Player" };
  }

  revalidatePath("/dashboard/players");
  /* stay on same page after deletion */
  return {};
}
