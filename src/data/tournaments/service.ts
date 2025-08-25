// src/data/tournaments/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";

import { TournamentModel } from "./schema";
import {
  TournamentCreate,
  TournamentUpdate,
  type Tournament,
  SCHEDULER_DEFAULTS,
} from "./dto";
import { toTournamentOut, toTournamentOutMany } from "./serializers";

export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, any>;
};

/* helpers to read basic types from FormData (presence booleans) */
const fd = {
  str: (f: FormData, k: string, d = "") => String(f.get(k) ?? d),
  bool: (f: FormData, k: string) => !!f.get(k),
  num: (f: FormData, k: string, d: number) => {
    const v = f.get(k);
    if (v == null || v === "") return d;
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  },
};

/**
 * Dump FormData for debugging
 */
export async function dumpFormData(form: FormData) {
  const out: Record<string, any> = {};
  for (const [k, v] of form.entries()) {
    out[k] = typeof v === "string" ? v : `(File:${(v as File).name})`;
  }
  return out;
}

/**
 * Dump date status for debugging
 */
export async function dumpDateStatus(v: unknown) {
  const d = new Date(String(v));
  return { raw: v, iso: isNaN(d.getTime()) ? "Invalid Date" : d.toISOString() };
}

/* CREATE */
export async function createTournament(
  ownerId: string,
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  logger.debug("tournaments.create.formdata", dumpFormData(form));
  logger.debug("tournaments.create.ownerId", { ownerId });

  const payload = {
    name: fd.str(form, "name"),
    startDate: fd.str(form, "startDate"),
    endDate: fd.str(form, "endDate"),
    ownerId,
    settings: {
      schedulerMode: fd.str(
        form,
        "settings.schedulerMode",
        SCHEDULER_DEFAULTS.schedulerMode
      ),
      doubleRoundRobin: fd.bool(form, "settings.doubleRoundRobin"),
      minGapMinutesSameDay: fd.num(
        form,
        "settings.minGapMinutesSameDay",
        SCHEDULER_DEFAULTS.minGapMinutesSameDay
      ),
      maxBacktracks: fd.num(
        form,
        "settings.maxBacktracks",
        SCHEDULER_DEFAULTS.maxBacktracks
      ),
      balancePreferredStarts: fd.bool(form, "settings.balancePreferredStarts"),
      allowSameDayDoubleHeader: fd.bool(
        form,
        "settings.allowSameDayDoubleHeader"
      ),
    },
  };

  logger.debug("tournaments.create.date_sanity", {
    start: dumpDateStatus(payload.startDate),
    end: dumpDateStatus(payload.endDate),
  });

  const parsed = TournamentCreate.safeParse(payload);
  if (!parsed.success) {
    logger.debug("tournaments.create.validation_failed", {
      fieldErrors: parsed.error.flatten().fieldErrors, // { name?: string[], "settings.minGap..."?: string[] }
      formErrors: parsed.error.flatten().formErrors,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });

    return {
      ok: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors, // keys like "settings.minGapMinutesSameDay"
      values: payload, // sticky
    };
  }

  // 4) If you want to see the fully typed values after coercion
  logger.debug("tournaments.create.validated", parsed.data);

  try {
    await getConn();
    const doc = await TournamentModel.create(parsed.data);
    logger.info("tournament.created", { id: String(doc._id) });
  } catch (err: any) {
    logger.error(err);
    return {
      ok: false,
      message: "Database Error: Failed to Create Tournament.",
      values: payload,
    };
  }

  revalidatePath(`/tournament/${ownerId}`);
  redirect(`/tournament/${ownerId}`);
}

/* LIST — always serialize */
export async function listTournaments(): Promise<Tournament[]> {
  await getConn();
  const rows = await TournamentModel.find(
    {},
    { _id: 1, name: 1, startDate: 1, endDate: 1, settings: 1 }
  )
    .sort({ startDate: 1 })
    .lean();
  return toTournamentOutMany(rows as any);
}

/* GET ONE — serialize or null */
export async function getTournament(id: string): Promise<Tournament | null> {
  await getConn();
  const row = await TournamentModel.findById(id).lean();
  return row ? toTournamentOut(row as any) : null;
}

/* UPDATE — partial (supports nested settings.*) */
export async function updateTournament(
  _prev: unknown,
  form: FormData
): Promise<ActionResult> {
  const payload = Object.fromEntries(form) as any; // can include settings.schedulerMode, etc.
  const parsed = TournamentUpdate.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
      values: payload,
    };
  }

  const { _id, ...update } = parsed.data;
  try {
    await getConn();
    const res = await TournamentModel.findByIdAndUpdate(_id, update, {
      runValidators: true,
    });
    if (!res) return { ok: false, message: "Tournament not found." };
  } catch (err: any) {
    logger.error(err);
    return {
      ok: false,
      message: "Database Error: Failed to Update Tournament.",
      values: payload,
    };
  }

  revalidatePath("/tournament");
  redirect("/tournament");
}

/* DELETE (soft) — unchanged */
export async function deleteTournament(
  id: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await getConn();
    const doc = await TournamentModel.findById(id); // visible (not deleted yet)
    if (!doc) return { ok: false, message: "Tournament not found." };
    await (doc as any).softDelete?.(by, reason); // instance method from plugin
  } catch (err: any) {
    logger.error(err);
    return {
      ok: false,
      message: "Database Error: Failed to Delete Tournament.",
    };
  }
  revalidatePath("/tournament");
  return { ok: true };
}

/* RESTORE — include the marker so the plugin lets us see the doc */
export async function restoreTournament(id: string): Promise<ActionResult> {
  try {
    await getConn();
    // findOne so we can pass the synthetic marker the plugin looks for
    const doc = await TournamentModel.findOne({ _id: id, withDeleted: true });
    if (!doc) return { ok: false, message: "Tournament not found." };
    await (doc as any).restore?.();
  } catch (err: any) {
    logger.error(err);
    return {
      ok: false,
      message: "Database Error: Failed to Restore Tournament.",
    };
  }
  revalidatePath("/tournament");
  return { ok: true };
}
