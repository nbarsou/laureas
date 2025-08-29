// src/data/tournaments/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getConn } from "@/lib/db";
import { time } from "@/lib/logging/timing";
import { logger } from "@/lib/logging";
import { zObjectId, safeParseForm, type ActionResult } from "@/data/_helpers";
import { TournamentModel } from "./model";
import {
  TournamentCreateIn,
  TournamentUpdateIn,
  toTournamentOut,
  type TournamentOut,
} from "./dto";

/* ─────────────────────────  C R E A T E  ───────────────────────── */

export async function createTournamentAction(
  ownerId: string, // bind in client
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("tournaments.create.start", { ownerId });

  const ownerOk = zObjectId.safeParse(ownerId);
  if (!ownerOk.success) {
    logger.warn("tournaments.create.invalid_ownerId", { ownerId });
    return { ok: false, message: "Invalid owner." };
  }

  // enforce server-side owner
  formData.set("ownerId", ownerOk.data);

  const validated = safeParseForm(formData, TournamentCreateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("tournaments.create.validation_failed", { fieldErrors });
    return {
      ok: false,
      message:
        "Oops! We couldn’t save your tournament yet — a few fields need your attention. Please double-check the form.",
      errors: fieldErrors,
      values: Object.fromEntries(formData), // sticky values
    };
  }

  try {
    await getConn();
    const doc = await time("db.tournaments.create", () =>
      TournamentModel.create(validated.data)
    );
    logger.info("tournaments.create.ok", { id: String(doc._id) });
  } catch (error) {
    logger.error("tournaments.create.db_error", error);
    return {
      ok: false,
      message: "Database Error: Failed to create tournament.",
    };
  }

  // Adjust the path to your routes:
  revalidatePath("/tournaments");
  redirect("/tournaments");
}

/* ─────────────────────────  U P D A T E  ───────────────────────── */

export async function updateTournamentAction(
  tournamentId: string, // bind in client
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("tournaments.update.start", { tournamentId });

  const idOk = zObjectId.safeParse(tournamentId);
  if (!idOk.success) {
    logger.warn("tournaments.update.invalid_id", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }

  // Server is source of truth for target _id
  formData.set("_id", idOk.data);

  const validated = safeParseForm(formData, TournamentUpdateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("tournaments.update.validation_failed", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed.",
      errors: fieldErrors,
      values: Object.fromEntries(formData),
    };
  }

  const { _id, ...patch } = validated.data;

  try {
    await getConn();
    const updated = await time("db.tournaments.updateById", () =>
      TournamentModel.findByIdAndUpdate(_id, patch, {
        runValidators: true,
        new: false,
      }).exec()
    );
    if (!updated) {
      logger.warn("tournaments.update.not_found", { _id: String(_id) });
      return { ok: false, message: "Tournament not found." };
    }
    logger.info("tournaments.update.ok", { id: String(_id) });
  } catch (error) {
    logger.error("tournaments.update.db_error", error);
    return {
      ok: false,
      message: "Database Error: Failed to update tournament.",
    };
  }

  revalidatePath(`/tournaments/${idOk.data}/settings`);
  redirect(`/tournaments/${idOk.data}/settings`);
}

/* ─────────────────────────  D E L E T E (soft)  ───────────────────────── */

export async function softDeleteTournamentAction(
  tournamentId: string, // bind in client
  _prev: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  logger.debug("tournaments.delete.start", { tournamentId });

  const idOk = zObjectId.safeParse(tournamentId);
  if (!idOk.success) {
    logger.warn("tournaments.delete.invalid_id", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }

  try {
    await getConn();
    const doc = await time("db.tournaments.getForDelete", () =>
      TournamentModel.findById(idOk.data).exec()
    );
    if (!doc) {
      logger.warn("tournaments.delete.not_found", { tournamentId });
      return { ok: false, message: "Tournament not found." };
    }
    await time("db.tournaments.softDelete", () => (doc as any).softDelete?.());
    logger.info("tournaments.delete.ok", { tournamentId });
  } catch (error) {
    logger.error("tournaments.delete.db_error", error);
    return {
      ok: false,
      message: "Database Error: Failed to delete tournament.",
    };
  }

  revalidatePath("/tournaments");
  redirect("/tournaments");
}

/* ─────────────────────────  R E S T O R E  ───────────────────────── */

export async function restoreTournamentAction(
  tournamentId: string, // bind in client
  _prev: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  logger.debug("tournaments.restore.start", { tournamentId });

  const idOk = zObjectId.safeParse(tournamentId);
  if (!idOk.success) {
    logger.warn("tournaments.restore.invalid_id", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }

  try {
    await getConn();
    const doc = await time("db.tournaments.getForRestore", () =>
      TournamentModel.findById(idOk.data).exec()
    );
    if (!doc) {
      logger.warn("tournaments.restore.not_found", { tournamentId });
      return { ok: false, message: "Tournament not found." };
    }
    await time("db.tournaments.restore", () => (doc as any).restore?.());
    logger.info("tournaments.restore.ok", { tournamentId });
  } catch (error) {
    logger.error("tournaments.restore.db_error", error);
    return {
      ok: false,
      message: "Database Error: Failed to restore tournament.",
    };
  }

  revalidatePath("/tournaments");
  redirect("/tournaments");
}

/* ─────────────────────────  R E A D S  (server-only helpers) ───────────────────────── */

export async function getTournament(id: string): Promise<TournamentOut | null> {
  const idOk = zObjectId.safeParse(id);
  if (!idOk.success) throw new Error("Invalid tournament id.");

  await getConn();
  const row = await time("db.tournaments.findById", () =>
    TournamentModel.findById(idOk.data).lean().exec()
  );
  return row ? toTournamentOut(row) : null;
}

export async function listTournaments(limit = 100): Promise<TournamentOut[]> {
  await getConn();
  const rows = await time("db.tournaments.list", () =>
    TournamentModel.find({ deletedAt: { $in: [null, undefined] } })
      .sort({ startDate: 1 })
      .limit(limit)
      .lean()
      .exec()
  );
  return rows.map(toTournamentOut);
}
