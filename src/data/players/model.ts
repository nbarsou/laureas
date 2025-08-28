import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "@/data/_plugins/version";
import { PLAYER_VERSION } from "./version";

// TODO: Add tournamentId, when adding auth to check. 

const PlayerSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    number: {
      type: Number,
      required: true,
      min: [1, "number must be >= 1"],
      max: [99, "number must be <= 99"],
      validate: {
        validator: Number.isInteger,
      },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

PlayerSchema.index(
  { teamId: 1, number: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
PlayerSchema.plugin(softDeletePlugin);
PlayerSchema.plugin(versionSemverPlugin, { defaultVersion: PLAYER_VERSION });
export const PlayerModel = models.Player || model("Player", PlayerSchema);
