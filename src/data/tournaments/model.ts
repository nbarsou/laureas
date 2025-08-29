// src/data/tournaments/model.ts
// import "server-only";
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "@/data/_plugins/version";

const TOURNAMENT_VERSION = "0.0.0";

/* Mongoose schema/model */
const TournamentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1 },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    roundRobinDouble: { type: Boolean, default: false },
    allowSameDayPlay: { type: Boolean, default: true },
    groupsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TournamentSchema.plugin(softDeletePlugin);
TournamentSchema.plugin(versionSemverPlugin, {
  defaultVersion: TOURNAMENT_VERSION,
});

export const TournamentModel =
  models.Tournament || model("Tournament", TournamentSchema);
