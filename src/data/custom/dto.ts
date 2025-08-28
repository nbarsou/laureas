import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

export const EntityTypeZ = z.enum(["team", "player", "tournament"]);
export const FieldTypeZ = z.enum(["text", "number", "boolean"]);

export const CreateLocalValueIn = z.object({
  entityType: EntityTypeZ,
  entityId: zObjectId,
  key: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  type: FieldTypeZ,
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  value: z.unknown().optional(),
});

export const CreateGlobalAndAssignIn = z.object({
  tournamentId: zObjectId,
  entityType: EntityTypeZ, // appliesTo + where to assign
  entityId: zObjectId,
  key: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  type: FieldTypeZ,
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  value: z.unknown().optional(),
});

export const UpdateValueIn = z.object({
  tournamentId: zObjectId,
  entityType: EntityTypeZ,
  entityId: zObjectId,
  key: z.string().min(1).max(64),
  value: z.unknown(),
});

export const PromoteToGlobalIn = z.object({
  tournamentId: zObjectId,
  entityType: EntityTypeZ,
  entityId: zObjectId,
  key: z.string().min(1).max(64),
  overrides: z
    .object({
      label: z.string().min(1).max(120).optional(),
      type: FieldTypeZ.optional(),
      required: z.boolean().optional(),
      defaultValue: z.unknown().optional(),
    })
    .optional(),
});

export const FieldSnapshotItemOut = z.object({
  key: z.string(),
  label: z.string(),
  type: FieldTypeZ,
  required: z.boolean(),
  scope: z.enum(["local", "global"]),
  value: z.unknown().optional(),
  displayValue: z.unknown().optional(),
  hydrated: z.boolean(),
  missingRequired: z.boolean(),
});

export const SnapshotOut = z.object({
  fields: z.array(FieldSnapshotItemOut),
});

export type FieldSnapshotItem = z.infer<typeof FieldSnapshotItemOut>;
export type Snapshot = z.infer<typeof SnapshotOut>;
