// data/teams/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { zObjectId } from "@/data/_helpers";

export const TeamSchema = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,
  name: z.string(),
  managers: z.email(),
});
export type Team = z.infer<typeof TeamSchema>;

const mongooseSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    managers: {
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

export const TeamModel = models.Team || model("Team", mongooseSchema);
