// data/tournaments/service.ts
/*==============================================================================
  CRUD - Tournament service – quick-reference
==============================================================================

Operation          How to call
-----------------  ------------------------------------------------------------
READ ALL           // Server Component
                   const tournaments = await fetchAllTournaments();

READ ONE           // Server Component
                   const tournament = await fetchTournamentById(params.id);

CREATE / UPDATE /  // Client Component
DELETE             const [state, action] =
                       useActionState(createTournament, initState);
                   // …and wire the form:
                   // <form action={action}> … </form>

Notes
-----
• fetch* helpers run only on the server (no revalidate/redirect).  
• create / update / delete all call revalidatePath("/dashboard/tournaments").  
• A single State type covers field-level errors + top-level messages.

==============================================================================*/

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TournamentSchema,
  TournamentModel,
  Tournament,
} from "@/data/tournaments/schema";
import { getConn } from "@/data/db";
import { logger } from "@/lib/logging";
import { zObjectId } from "@/data/_helpers";
import { ActionResult } from "@/data/_helpers";

/* Write-safe schema */
const WriteTournament = TournamentSchema.omit({
  _id: true,
});

/* Action-state shape */
export type State = {
  errors?: { name?: string[]; startDate?: string[]; endDate?: string[] };
  message?: string | null;
};

/* ════════════════  C R E A T E  ════════════════ */

export async function createTournament(
  prevState: State,
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = WriteTournament.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!validatedFields.success) {
    return {
      ok: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Tournament.",
    };
  }

  try {
    await getConn();
    await TournamentModel.create(validatedFields.data);
  } catch (error: any) {
    logger.error(error);
    return {
      ok: false,
      message: "Database Error: Failed to Create Tournament.",
    };
  }

  revalidatePath("/tournament");
  redirect("/tournament");
}

/* ════════════════  R E A D  ════════════════ */

export async function fetchAllTournaments(): Promise<Tournament[]> {
  await getConn();
  /* lean() returns plain objects → smaller payload for RSC */
  return await TournamentModel.find()
    .sort({ startDate: 1 })
    .lean<Tournament[]>();
}

export async function fetchTournamentById(
  id: string
): Promise<Tournament | null> {
  /* throws if not a valid ObjectId */
  if (!id) throw new Error("Missing route param id");
  zObjectId.parse(id);
  await getConn();

  return TournamentModel.findById(id).lean<Tournament>().exec();
}

/* ════════════════  U P D A T E  ════════════════ */

export async function updateTournament(
  prevState: State,
  formData: FormData
): Promise<ActionResult> {
  // ✅ convert FormData -> plain object of strings
  const raw = Object.fromEntries(formData); // { _id, name, startDate, endDate }

  const validatedFields = TournamentSchema.safeParse(raw);

  if (!validatedFields.success) {
    const { fieldErrors } = validatedFields.error.flatten();
    return {
      ok: false,
      message: "Missing Fields. Failed to Update Tournament.",
      errors: fieldErrors,
    };
  }

  const { _id, name, startDate, endDate } = validatedFields.data;

  try {
    await getConn();

    // ✅ correct signature: (id, updateDoc, options)
    await TournamentModel.findByIdAndUpdate(
      _id,
      { name, startDate, endDate },
      { runValidators: true, new: false }
    );
  } catch (error: any) {
    logger.error(error);
    return {
      ok: false,
      message: "Database Error: Failed to Update Tournament.",
      errors: {},
    };
  }

  revalidatePath("/tournament");
  redirect("/tournament");
}

/* ════════════════  D E L E T E  ════════════════ */
export async function deleteTournament(id: string): Promise<ActionResult> {
  const idCheck = zObjectId.safeParse(id);

  if (!idCheck.success) {
    return {
      ok: false,
      message: "Invalid id.",
    };
  }

  try {
    await getConn();
    await TournamentModel.findByIdAndDelete(idCheck.data);
  } catch (error: any) {
    logger.error(error);
    return {
      ok: false,
      message: "Database Error: Failed to Delete Tournament",
    };
  }

  revalidatePath("/tournament");
  /* stay on same page after deletion */
  return { ok: true };
}
