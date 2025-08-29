import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "@/data/_plugins/version";
import { TEAM_VERSION } from "./version";

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
