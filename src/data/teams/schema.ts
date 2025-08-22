// data/teams/schema.ts
import { z } from "zod";
import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";
import { zObjectId } from "@/data/_helpers";

export const TeamSchema = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,
  name: z.string(),
  manager: z.email(),
});
export type Team = z.infer<typeof TeamSchema>;

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export type TeamDb = InferSchemaType<typeof mongooseSchema> & {
  _id: Types.ObjectId;
};

export type TeamModelType = Model<TeamDb>;
export const TeamModel =
  (models.Team as TeamModelType | undefined) ??
  model<TeamDb>("Team", mongooseSchema);
