import { Schema, model, models, InferSchemaType } from "mongoose";
import { ObjectId } from "./_helpers";

const PlayerSchema = new Schema(
  {
    teamId: { type: ObjectId, ref: "Team", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    number: { type: Number, min: 1, max: 99, required: true },
  },
  { timestamps: true }
);

export type PlayerDoc = InferSchemaType<typeof PlayerSchema>;
export const Player = models.Player || model("Player", PlayerSchema);
