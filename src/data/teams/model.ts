import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "@/data/_plugins/version";
import { TEAM_VERSION } from "./version";

// Regex used both in Mongoose and (optionally) in Zod below
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

const TeamSchema = new Schema(
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

TeamSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
TeamSchema.plugin(softDeletePlugin);
TeamSchema.plugin(versionSemverPlugin, { defaultVersion: TEAM_VERSION });

export const TeamModel = models.Team || model("Team", TeamSchema);
export { TeamSchema };
