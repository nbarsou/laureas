// src/data/custom/globalDefs.model.ts
import { Schema, model, models } from "mongoose";
import { versionSemverPlugin } from "../_plugins/version";
import { GLOBAL_VERSION } from "./version";
import { softDeletePlugin } from "../_plugins/softDelete";

const GlobalDefSchema = new Schema(
  {
    tournamentId: { type: Schema.Types.ObjectId, required: true, index: true },
    appliesTo: {
      type: String,
      enum: ["team", "player", "tournament"],
      required: true,
    },
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "boolean"], required: true },
    required: { type: Boolean, default: false },
    defaultValue: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// unique per (tournament, entity kind, key)
GlobalDefSchema.index(
  { tournamentId: 1, appliesTo: 1, key: 1 },
  { unique: true }
);
GlobalDefSchema.plugin(versionSemverPlugin, { defaultVersion: GLOBAL_VERSION });
GlobalDefSchema.plugin(softDeletePlugin);

export const GlobalFieldDefModel =
  models.GlobalFieldDef || model("GlobalFieldDef", GlobalDefSchema);
