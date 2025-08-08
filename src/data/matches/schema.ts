// data/matches/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { zObjectId } from "@/data/_helpers";

/** ---------- matches ---------- */
export const MatchSchema = z.object({
  _id: zObjectId.optional(),
  tournamentId: zObjectId,
  round: z.number().int().positive(),
  homeTeamId: zObjectId,
  awayTeamId: zObjectId,
  score: z
    .object({
      home: z.number().int().nonnegative(),
      away: z.number().int().nonnegative(),
    })
    .optional(),
});

export type Match = z.infer<typeof MatchSchema>;

const mongooseSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    round: {
      type: Number,
      required: true,
      min: [1, "round must be >= 1"],
      validate: {
        validator: Number.isInteger,
        message: "round must be an integer",
      },
      index: true,
    },
    homeTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    awayTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    score: {
      home: {
        type: Number,
        min: [0, "home score must be >= 0"],
        validate: {
          validator: Number.isInteger,
          message: "home score must be an integer",
        },
      },
      away: {
        type: Number,
        min: [0, "away score must be >= 0"],
        validate: {
          validator: Number.isInteger,
          message: "away score must be an integer",
        },
      },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const MatchModel = models.Match || model("Match", mongooseSchema);
