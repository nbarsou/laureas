import { Schema, model, models, InferSchemaType } from "mongoose";
import { ObjectId } from "./_helpers";

const MatchSchema = new Schema(
  {
    tournamentId: { type: ObjectId, ref: "Tournament", required: true },
    round: { type: Number, required: true, min: 1 },
    homeTeamId: { type: ObjectId, ref: "Team", required: true },
    awayTeamId: { type: ObjectId, ref: "Team", required: true },

    score: {
      home: { type: Number, min: 0 },
      away: { type: Number, min: 0 },
    },

    stats: { type: Schema.Types.Mixed }, // free-form JSON object
  },
  { timestamps: true }
);

export type MatchDoc = InferSchemaType<typeof MatchSchema>;
export const Match = models.Match || model("Match", MatchSchema);
