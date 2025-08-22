// data/groups/schema.ts
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";

type Role = "admin" | "staff";
const mongooseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      required: true,
      index: true,
    },
    // optional: granular overrides
    permissions: { type: [String], default: [] }, // e.g. ["team.delete","match.edit"]
  },
  { timestamps: true }
);

mongooseSchema.index(
  { userId: 1, tournamentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);

export const MembershipModel =
  models.Membership ?? model("Membership", mongooseSchema);
