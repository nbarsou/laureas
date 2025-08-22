// data/groups/schema.ts
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const TimeWindow = new Schema(
  { start: { type: String, match: HHMM }, end: { type: String, match: HHMM } },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
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
  },
  { timestamps: true }
);

mongooseSchema.index({ tournamentId: 1, name: 1 }, { unique: true });
mongooseSchema.plugin(softDeletePlugin);

export const GroupModel =
  models.Group ?? model("Group", mongooseSchema);
