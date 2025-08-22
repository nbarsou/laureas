// data/managers/schema.ts
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";

const mongooseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    }, // denormalized for fast guards
    // optional: narrow permissions (e.g., canInvitePlayers)
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

mongooseSchema.index(
  { userId: 1, teamId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);

export const ManagerModel =
  models.Manager ?? model("Manager", mongooseSchema);
