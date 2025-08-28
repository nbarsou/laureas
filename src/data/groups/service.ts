// src/data/groups/service.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { GroupModel } from "./model";
import { GroupCreateIn, GroupUpdateIn, GroupOut } from "./dto";
import { toGroupOut } from "./serializer";

import { getConn } from "@/lib/db";
import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";

import {
  ActionResult,
  formDataToObject,
  safeParseForm,
  zObjectId,
} from "../_helpers";
import { error } from "console";

/* ════════════════  C R E A T E  ════════════════ */

export async function createGroup(
  tid: string,
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  logger.debug("group.create.start", { tid });

  const tidOk = zObjectId.safeParse(tid);
  if (!tidOk.success) {
    logger.warn("group.create.invalid_tournamentId", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  formData.set("tournamentId", tid);

  const validated = safeParseForm(formData, GroupCreateIn);

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("group.create.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed",
      errors: fieldErrors,
    };
  }

  try {
    await getConn();

    const doc = await time("db.groups.create", () =>
      GroupModel.create(validated.data)
    );
    logger.info("group.create.ok", {
      id: String(doc._id),
      tournamentId: String(doc.tournamentId),
    });
  } catch (error: Error | any) {
    logger.error("group.create.failed", { error });
    return { ok: false, message: "Database Error: Failed to Create Group." };
  }

  revalidatePath(`/tournaments/${tid}/players`);
  redirect(`/tournaments/${tid}/players`);
}

// ============ READ ===========

export async function getGroup(groupId: string): Promise<GroupOut | null> {
  logger.debug("groups.get.start", { groupId });
  const id = zObjectId.safeParse(groupId);
  if (!id.success) {
    logger.warn("groups.get.invalid_id", { groupId });
    throw new Error("Invalid group id.");
  }

  let row;
  try {
    await getConn();
    row = await time("db.groups.findById", () =>
      GroupModel.findById(id.data).lean().exec()
    );
  } catch (error) {
    logger.error("group.get.db_conn", error);
    throw new Error("Database Error: Failed to get Group.");
  }
  logger.debug("groups.get.ok", { groupId, found: !!row });
  return row ? toGroupOut(row) : null;
}

export async function listGroups(
  tournamentId: string,
  limit = 100
): Promise<GroupOut[] | null> {
  logger.debug("groups.list.byTournamentId.start", { tournamentId });
  const id = zObjectId.safeParse(tournamentId);
  if (!id.success) {
    logger.warn("groups.list.byTournamentId.invalid", { tournamentId });
    throw new Error("Invalid tournament id.");
  }

  let rows;
  try {
    await getConn();
    rows = await time("db.groups.find", () =>
      GroupModel.find({ tournamentId: id.data }).limit(limit).lean().exec()
    );
  } catch (error) {
    logger.error("groups.list.byTournamentId.db_conn", error);
    return [];
  }
  logger.debug("groups.list.byTournamentId.ok", { tournamentId });
  return rows ? rows.map(toGroupOut) : null;
}

// =========== UPDATE ===========
export async function updateGroup(
  tid: string,
  _prevState: unknown,
  form: FormData
): Promise<ActionResult> {
  logger.debug("groups.update.start", { tid });

  const idCheck = zObjectId.safeParse(tid);
  if (!idCheck.success) {
    logger.warn("groups.update.invalid_id", { tid });
    return { ok: false, message: "Invalid tournament id." };
  }

  const validated = safeParseForm(form, GroupUpdateIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("groups.update.invalid", { fieldErrors });
    return {
      ok: false,
      message: "Validation failed",
      errors: fieldErrors,
    };
  }

  const { _id, ...patch } = validated.data;

  if (!_id) {
    logger.warn("groups.update.missing_id");
    return { ok: false, message: "Missing group id." };
  }

  try {
    await getConn();
    const updated = await time("db.groups.updateById", () =>
      GroupModel.findByIdAndUpdate(_id, patch, { runValidators: true })
    );
    if (!updated) {
      logger.warn("groups.update.not_found", { id: String(_id) });
      return { ok: false, message: "Group not found." };
    }
  } catch (error) {
    logger.error("groups.update.fail", error);
    return { ok: false, message: "Database Error: Failed to Update Group." };
  }

  revalidatePath(`/tournaments/${tid}/players`); // TODO: Adjust later
  redirect(`/tournaments/${tid}/players`);
}

// =========== DELETE ===========
export async function deleteGroup(
  tid: string,
  groupId: string,
  by?: string,
  reason?: string
): Promise<ActionResult> {
  logger.debug("groups.delete.start", { groupId });

  const id = zObjectId.safeParse(groupId);
  if (!id.success) {
    logger.warn("groups.delete.invalid_id", { groupId });
    return { ok: false, message: "Invalid group id." };
  }

  try {
    await getConn();
    const group = await time("db.groups.findById", () =>
      GroupModel.findById(id.data).exec()
    );
    if (!group) {
      logger.warn("groups.delete.not_found", { groupId });
      return { ok: false, message: "Group not found." };
    }
    await time("db.groups.softDelete", () =>
      (group as any).softDelete?.(by, reason)
    );
    logger.info("groups.delete.ok", { groupId });
  } catch (error) {
    logger.error("groups.delete.fail", error);
    return { ok: false, message: "Database Error: Failed to Delete Group." };
  }

  revalidatePath(`/tournaments/${tid}/players`);
  return { ok: true };
}

export async function restoreGroup(
  tid: string,
  groupId: string
): Promise<ActionResult> {
  logger.debug("groups.restore.start", { groupId });

  const id = zObjectId.safeParse(groupId);
  if (!id.success) {
    logger.warn("groups.restore.invalid_id", { groupId });
    return { ok: false, message: "Invalid group id." };
  }

  try {
    await getConn();
    const group = await time("db.groups.findById", () =>
      GroupModel.findById(id.data).exec()
    );
    if (!group) {
      logger.warn("groups.restore.not_found", { groupId });
      return { ok: false, message: "Group not found." };
    }
    await time("db.groups.restore", () => (group as any).restore?.());
    logger.info("groups.restore.ok", { groupId });
  } catch (error) {
    logger.error("groups.restore.fail", error);
    return { ok: false, message: "Database Error: Failed to Restore Group." };
  }

  revalidatePath(`/tournaments/${tid}/players`);
  return { ok: true };
}
