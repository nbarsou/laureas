"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Types } from "mongoose";

import { logger } from "@/lib/logging";
import { time } from "@/lib/logging/timing";
import { getConn } from "@/lib/db";

import { CustomFieldEntryModel } from "./entries.model";
import { CreateLocalValueIn } from "./dto";
import { safeParseForm, zObjectId } from "@/data/_helpers";

export type EntityType = "team" | "player" | "tournament";
export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, any>;
};

type FieldType = "text" | "number" | "boolean";
const oid = (v: unknown) =>
  v instanceof Types.ObjectId ? v : new Types.ObjectId(String(v));

function coerceToType(val: unknown, t: FieldType): string | number | boolean {
  if (t === "text") return String(val ?? "");
  if (t === "number") {
    const n = typeof val === "string" ? Number(val.trim()) : Number(val);
    if (!Number.isFinite(n)) throw new Error("INVALID_NUMBER");
    return n;
  }
  if (typeof val === "boolean") return val;
  if (typeof val === "string")
    return ["true", "1", "on", "yes"].includes(val.toLowerCase());
  if (typeof val === "number") return val !== 0;
  return false;
}

/* ───────────────────────────── CREATE (local-only) ───────────────────────────── */

export async function createLocalCustomField(
  tournamentId: string,
  entityType: EntityType,
  entityId: string,
  formData: FormData
): Promise<ActionResult | never> {
  logger.debug("custom.create.start", { tournamentId, entityType, entityId });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("custom.create.invalid.tid", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }
  const id = zObjectId.safeParse(entityId);
  if (!id.success) {
    logger.warn("custom.create.invalid.id", { entityId });
    return { ok: false, message: "Invalid entity id." };
  }

  // Inject context for validation
  formData.set("entityType", entityType);
  formData.set("entityId", entityId);

  const validated = safeParseForm(formData, CreateLocalValueIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("custom.create.invalid.form", { fieldErrors });
    return { ok: false, message: "Validation failed.", errors: fieldErrors };
  }

  // Coerce value to the declared type if provided
  const payload = { ...validated.data };
  if (payload.value !== undefined) {
    payload.value = coerceToType(payload.value, payload.type);
  }

  try {
    await getConn();
    const doc = await time("db.custom.create", () =>
      CustomFieldEntryModel.create({
        ...payload,
        isLocalDef: true,
      })
    );
    logger.info("custom.create.ok", {
      id: String(doc._id),
      entityType,
      entityId,
      key: payload.key,
    });
  } catch (error) {
    logger.error("custom.create.fail", { error, entityType, entityId });
    return {
      ok: false,
      message: "Database error: Failed to create custom field.",
    };
  }

  const basePath = `/tournament/${tournamentId}/${entityType}/${entityId}`;
  revalidatePath(basePath);
  redirect(basePath);
}

/* ───────────────────────────── UPDATE DEF (local-only) ─────────────────────────────
   - Updates label/type/required/defaultValue and optionally the current value.
   - No upsert: if it doesn't exist, returns not found.
------------------------------------------------------------------------------- */

export async function updateLocalCustomField(
  tournamentId: string,
  entityType: EntityType,
  entityId: string,
  formData: FormData
): Promise<ActionResult | never> {
  logger.debug("custom.update.start", { tournamentId, entityType, entityId });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("custom.update.invalid.tid", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }
  const id = zObjectId.safeParse(entityId);
  if (!id.success) {
    logger.warn("custom.update.invalid.id", { entityId });
    return { ok: false, message: "Invalid entity id." };
  }

  // Expect same fields as CreateLocalValueIn (simple for now)
  formData.set("entityType", entityType);
  formData.set("entityId", entityId);

  const validated = safeParseForm(formData, CreateLocalValueIn);
  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error);
    logger.warn("custom.update.invalid.form", { fieldErrors });
    return { ok: false, message: "Validation failed.", errors: fieldErrors };
  }

  const { key, label, type, required, defaultValue, value } = validated.data;
  const $set: any = {
    isLocalDef: true,
    label,
    type,
    required: !!required,
    defaultValue,
  };
  if (value !== undefined) $set.value = coerceToType(value, type);

  try {
    await getConn();
    const res = await time("db.custom.update", () =>
      CustomFieldEntryModel.updateOne(
        { entityType, entityId: oid(entityId), key, isLocalDef: true },
        { $set }
      ).exec()
    );
    if (res.matchedCount === 0) {
      logger.debug("custom.update.not_found", { entityType, entityId, key });
      return { ok: false, message: "Custom field not found." };
    }
    logger.info("custom.update.ok", { entityType, entityId, key });
  } catch (error) {
    logger.error("custom.update.fail", { error, entityType, entityId });
    return {
      ok: false,
      message: "Database error: Failed to update custom field.",
    };
  }

  const basePath = `/tournament/${tournamentId}/${entityType}/${entityId}`;
  revalidatePath(basePath);
  redirect(basePath);
}

/* ───────────────────────────── UPDATE VALUE ONLY ─────────────────────────────
   - Update only the .value using stored type; no schema changes.
   - No upsert: requires the local field to exist.
------------------------------------------------------------------------------- */

export async function setLocalCustomValue(
  tournamentId: string,
  entityType: EntityType,
  entityId: string,
  key: string,
  rawValue: unknown
): Promise<ActionResult> {
  logger.debug("custom.value.set.start", {
    tournamentId,
    entityType,
    entityId,
    key,
  });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("custom.value.set.invalid.tid", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }
  const id = zObjectId.safeParse(entityId);
  if (!id.success) {
    logger.warn("custom.value.set.invalid.id", { entityId });
    return { ok: false, message: "Invalid entity id." };
  }

  try {
    await getConn();
    const entry = await time("db.custom.getForSet", () =>
      CustomFieldEntryModel.findOne({
        entityType,
        entityId: oid(entityId),
        key,
        isLocalDef: true,
      })
        .select({ type: 1 })
        .lean()
        .exec()
    );
    if (!entry) {
      logger.debug("custom.value.set.not_found", { entityType, entityId, key });
      return { ok: false, message: "Custom field not found." };
    }

    const coerced = coerceToType(rawValue, entityType as FieldType);

    const res = await time("db.custom.value.set", () =>
      CustomFieldEntryModel.updateOne(
        { entityType, entityId: oid(entityId), key, isLocalDef: true },
        { $set: { value: coerced } }
      ).exec()
    );
    if (res.matchedCount === 0) {
      return { ok: false, message: "Custom field not found." };
    }

    logger.info("custom.value.set.ok", { entityType, entityId, key });
    return { ok: true };
  } catch (error) {
    logger.error("custom.value.set.fail", { error, entityType, entityId, key });
    return {
      ok: false,
      message: "Database error: Failed to set custom value.",
    };
  }
}

/* ───────────────────────────── DELETE (local-only) ─────────────────────────────
   - Hard delete the local custom field for this entity.
------------------------------------------------------------------------------- */

export async function deleteLocalCustomField(
  tournamentId: string,
  entityType: EntityType,
  entityId: string,
  key: string
): Promise<ActionResult> {
  logger.debug("custom.delete.start", {
    tournamentId,
    entityType,
    entityId,
    key,
  });

  const tid = zObjectId.safeParse(tournamentId);
  if (!tid.success) {
    logger.warn("custom.delete.invalid.tid", { tournamentId });
    return { ok: false, message: "Invalid tournament id." };
  }
  const id = zObjectId.safeParse(entityId);
  if (!id.success) {
    logger.warn("custom.delete.invalid.id", { entityId });
    return { ok: false, message: "Invalid entity id." };
  }

  try {
    await getConn();
    const res = await time("db.custom.delete", () =>
      CustomFieldEntryModel.deleteOne({
        entityType,
        entityId: oid(entityId),
        key,
        isLocalDef: true,
      }).exec()
    );

    if (res.deletedCount === 0) {
      logger.debug("custom.delete.not_found", { entityType, entityId, key });
      return { ok: false, message: "Custom field not found." };
    }

    logger.info("custom.delete.ok", { entityType, entityId, key });
    return { ok: true };
  } catch (error) {
    logger.error("custom.delete.fail", { error, entityType, entityId, key });
    return {
      ok: false,
      message: "Database error: Failed to delete custom field.",
    };
  }
}

/* ───────────────────────────── READ (list/snapshot) ─────────────────────────────
   - List local custom fields and a tiny "snapshot" for UI.
------------------------------------------------------------------------------- */

export async function listLocalCustomFields(
  entityType: EntityType,
  entityId: string
) {
  logger.debug("custom.list.start", { entityType, entityId });

  const id = zObjectId.safeParse(entityId);
  if (!id.success) {
    logger.warn("custom.list.invalid.id", { entityId });
    throw new Error("Invalid entity id.");
  }

  try {
    await getConn();
    const rows = await time("db.custom.list", () =>
      CustomFieldEntryModel.find({
        entityType,
        entityId: oid(entityId),
        isLocalDef: true,
      })
        .sort({ key: 1 })
        .lean()
        .exec()
    );

    logger.debug("custom.list.ok", {
      entityType,
      entityId,
      count: rows.length,
    });
    return rows;
  } catch (error) {
    logger.error("custom.list.fail", { error, entityType, entityId });
    throw new Error("Database error: Failed to list custom fields.");
  }
}

export async function getLocalCustomSnapshot(
  entityType: EntityType,
  entityId: string
) {
  const rows = await listLocalCustomFields(entityType, entityId);

  // Minimal snapshot: mirrors your UI shape, scope always "local"
  const fields = rows.map((e) => ({
    key: e.key,
    label: e.label ?? e.key,
    type: (e.type as FieldType) ?? "text",
    required: !!e.required,
    scope: "local" as const,
    value: e.value,
    displayValue: e.value ?? e.defaultValue,
    hydrated: e.value !== undefined,
    missingRequired: !!e.required && e.value === undefined,
  }));

  return { fields };
}
