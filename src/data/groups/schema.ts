// data/groups/schema.ts
import { z } from "zod";
import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { zObjectId } from "@/data/_helpers";
import { versionSemverPlugin } from "../_plugins/version";
import { VERSIONS } from "../version";

// --- Shared regex (HH:MM) ---
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ---------- ZOD LAYERS ----------

// What your API accepts when creating a group
export const GroupCreate = z.object({
  tournamentId: zObjectId,
  name: z.string().min(1, "Name is required").max(60),
  slug: z.string().trim().toLowerCase().optional(),
  availability: z
    .object({
      // keys are "0".."6" (Sun..Sat) or any string you choose
      allowed: z
        .record(
          z.string(),
          z.array(
            z.object({
              start: z.string().regex(HHMM, "Use HH:MM"),
              end: z.string().regex(HHMM, "Use HH:MM"),
            })
          )
        )
        .optional(),
      preferredStarts: z.array(z.string().regex(HHMM, "Use HH:MM")).optional(),
    })
    .partial()
    .optional(),
});

// For PATCH/PUT
export const GroupUpdate = GroupCreate.partial().extend({
  _id: zObjectId,
});

// What you return to the UI (ids as strings)
export const GroupOut = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  name: z.string(),
  slug: z.string().optional(),
});

export type Group = z.infer<typeof GroupOut>;

// ---------- MONGOOSE LAYER ----------

const TimeWindow = new Schema(
  {
    start: { type: String, match: HHMM },
    end: { type: String, match: HHMM },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    // Map<string, TimeWindow[]>
    allowed: { type: Map, of: [TimeWindow], default: undefined },
    preferredStarts: { type: [String], default: [] },
  },
  { _id: false }
);

const mongooseSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, trim: true, lowercase: true, index: true },
    availability: { type: AvailabilitySchema, default: undefined },
    // If your softDeletePlugin adds isDeleted, leave it implicit
  },
  { timestamps: true }
);

// Unique name per tournament; keep compatible with soft delete (if your plugin adds isDeleted)
mongooseSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.plugin(versionSemverPlugin, { defaultVersion: VERSIONS.group });

// Strongly typed model exports
export type GroupDb = InferSchemaType<typeof mongooseSchema> & {
  _id: Types.ObjectId;
};
export type GroupModelType = Model<GroupDb>;

export const GroupModel =
  (models.Group as GroupModelType | undefined) ??
  model<GroupDb>("Group", mongooseSchema);
