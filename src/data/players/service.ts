// data/players/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  PlayerCreate,
  PlayerModel,
  Player,
  PlayerUpdate,
} from "@/data/players/schema";
import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";
import { ActionResult } from "@/data/_helpers";

/* ════════════════  C R E A T E  ════════════════ */

export async function createPlayer(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = PlayerCreate.safeParse({
    teamId: formData.get("teamId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    number: formData.get("number"),
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Player.",
    };
  }

  try {
    await getConn();
    await PlayerModel.create(validatedFields.data);
  } catch (error: any) {
    logger.error(error);
    return { ok: false, message: "Database Error: Failed to Create Player." };
  }

  revalidatePath("/tournament/players"); // TODO: adjust later
  redirect("/tournament/players");
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllPlayers(): Promise<Player[]> {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return PlayerModel.find().sort({ name: 1 }).lean<Player[]>();
}

export async function fetchPlayerById(id: string): Promise<Player | null> {
  /* throws if not a valid ObjectId */
  zObjectId.parse(id);
  await getConn();
  return PlayerModel.findById(id).lean<Player>();
}

export async function fetchPlayersByTeam(teamId: string): Promise<Player[]> {
  // Validate the teamId
  zObjectId.parse(teamId);

  await getConn();

  // Get all players from those teams
  return await PlayerModel.find({ teamId }).lean<Player[]>();
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updatePlayer(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(formData.get("_id"));

  const validatedFields = PlayerUpdate.safeParse({
    teamId: formData.get("teamId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    number: formData.get("number"),
  });

  if (!validatedFields.success) {
    return {
      ok: false,
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
    return { ok: false, message: "Database Error: Failed to Update Player." };
  }

  revalidatePath("/tournament/players"); // TODO: adjust later
  redirect("/tournament/players");
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deletePlayer(
  id: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await getConn();
    const player = await PlayerModel.findById(id);
    if (!player) {
      return { ok: false, message: "Player not found." };
    }
    await (player as any).softDelete(by, reason); // static method from plugin
  } catch (error: any) {
    logger.error(error);
    return { ok: false, message: "Database Error: Failed to Delete Player." };
  }

  revalidatePath("/tournament/players"); // TODO: adjust later
  return { ok: true };
}
