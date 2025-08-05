import { Schema, model, models, InferSchemaType } from "mongoose";

const TournamentSchema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // `_id` is implicit; Mongoose adds it automatically
  },
  { timestamps: true } // createdAt & updatedAt
);

export type TournamentDoc = InferSchemaType<typeof TournamentSchema>;
export const Tournament =
  models.Tournament || model("Tournament", TournamentSchema);
