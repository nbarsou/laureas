// data/teams/schema.ts
import { string, z } from "zod";
import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { zObjectId } from "@/data/_helpers";
import { group } from "console";
import { versionSemverPlugin } from "../_plugins/version";
import { VERSIONS } from "../version";

// Regex used both in Mongoose and (optionally) in Zod below
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const TeamCreate = z.object({
  tournamentId: zObjectId,
  groupId: zObjectId.optional(), // not required in Mongoose schema
  name: z.string().min(1, "Name is required"),
  manager: z.string().email("Invalid email"),
  // Availability is optional and flexible. Tighten later if needed.
  availability: z
    .object({
      allowed: z
        .record(
          z.string(), // keys "0".."6"
          z.array(
            z.object({
              start: z.string().regex(HHMM, "Use HH:MM"),
              end: z.string().regex(HHMM, "Use HH:MM"),
            })
          )
        )
        .optional(),
      preferredStarts: z
        .array(z.string().regex(HHMM, "Use HH:MM"))
        .default([])
        .optional(),
    })
    .partial()
    .optional(),
});

export const TeamUpdate = TeamCreate.partial().extend({
  _id: zObjectId,
});

// What you return to the UI (ids as strings)
export const TeamOut = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  groupId: z.string().optional(),
  name: z.string(),
  manager: z.string().email(),
  // If you want to include availability in responses, add it here later.
});

export type Team = z.infer<typeof TeamOut>;

const TimeWindow = new Schema(
  {
    start: { type: String, match: HHMM },
    end: { type: String, match: HHMM },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    allowed: { type: Map, of: [TimeWindow], default: undefined }, // keys "0".."6"
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
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      index: true,
    },
    name: { type: String, required: true, trim: true },
    manager: {
      type: String, // z.email() → single email
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      required: true,
    },
    availability: { type: AvailabilitySchema, default: undefined },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

mongooseSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.plugin(versionSemverPlugin, { defaultVersion: VERSIONS.team });

export type TeamDb = InferSchemaType<typeof mongooseSchema> & {
  _id: Types.ObjectId;
};

export type TeamModelType = Model<TeamDb>;
export const TeamModel =
  (models.Team as TeamModelType | undefined) ??
  model<TeamDb>("Team", mongooseSchema);
