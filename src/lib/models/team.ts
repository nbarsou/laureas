import { Schema, model, models, InferSchemaType } from "mongoose";
import { ObjectId } from "./_helpers";

const TeamSchema = new Schema(
  {
    tournamentId: { type: ObjectId, ref: "Tournament", required: true },
    name: { type: String, required: true },
    managers: [{ type: String, match: /.+@.+\..+/ }], // emails
  },
  { timestamps: true }
);

export type TeamDoc = InferSchemaType<typeof TeamSchema>;
export const Team = models.Team || model("Team", TeamSchema);
