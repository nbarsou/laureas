// src/data/teams/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { zObjectId, safeParseForm, type ActionResult } from "@/data/_helpers";
import { TeamCreateIn } from "@/data/teams/dto";
import { createTeamRepo } from "@/data/teams/repo";
import { logger } from "@/lib/logging";

/**
 * Top-level server action for useActionState.
 * Will be called as createTeamAction.bind(null, tid) from the client.
 */
export async function createTeamAction(
  tid: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("teams.create.start", { tid });

  const tidOk = zObjectId.safeParse(tid);
  if (!tidOk.success) {
    logger.warn("teams.create.invalid_tournamentId", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  // Enforce the source of truth on the server:
  formData.set("tournamentId", tidOk.data);

  // Zod validation (FormData-friendly via TeamCreateIn)
  const validated = safeParseForm(formData, TeamCreateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("teams.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors, // Record<string, string[]>
      values: Object.fromEntries(formData), // sticky values
    };
  }

  try {
    const id = await createTeamRepo(validated.data);
    logger.info("teams.create.ok", { id, tournamentId: tidOk.data });
  } catch (error) {
    logger.error("teams.create.fail", error);
    return { ok: false, message: "Database Error: Failed to create team." };
  }

  revalidatePath(`/tournaments/${tidOk.data}/teams`);
  redirect(`/tournaments/${tidOk.data}/teams`);
}
