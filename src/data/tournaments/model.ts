// src/data/tournaments/schema.ts
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { TOURNAMENT_VERSION } from "./version";

const SchedulerSettingsMongoose = new Schema({
  schedulerMode: {
    type: String,
    enum: ["spread", "compressed"],
    default: "compressed",
  },
  doubleRoundRobin: { type: Boolean, default: false },
  minGapMinutesSameDay: { type: Number, default: 60 },
  maxBacktracks: { type: Number, default: 400 },
  balancePreferredStarts: { type: Boolean, default: true },
  allowSameDayDoubleHeader: { type: Boolean, default: true },
  // ✅ Added fields
  groupsEnabled: { type: Boolean, default: false },
  groupsMode: {
    type: String,
    enum: ["manual", "auto"],
    default: "manual",
  },
});

/* Mongoose schema/model */
const TournamenSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    settings: SchedulerSettingsMongoose,
    default: {},
  },
  { timestamps: true }
);

TournamenSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
TournamenSchema.plugin(softDeletePlugin);
TournamenSchema.plugin(versionSemverPlugin, {
  defaultVersion: TOURNAMENT_VERSION,
});

export const TournamentModel =
  models.Tournament || model("Tournament", TournamenSchema);
