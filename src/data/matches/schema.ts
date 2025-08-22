// data/matches/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";
import { zObjectId } from "@/data/_helpers";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
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
    leg: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
      validate: Number.isInteger,
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

    venueId: { type: Schema.Types.ObjectId, ref: "Venue", index: true },
    date: { type: Date, index: true },
    start_time: { type: String, match: HHMM },
    end_time: { type: String, match: HHMM },

    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "canceled"],
      default: "pending",
      index: true,
    },
    conflict_reason: { type: String },

    score: {
      home: {
        type: Number,
        min: [0, "home score must be >= 0"],
        validate: {
          validator: Number.isInteger,
        },
      },
      away: {
        type: Number,
        min: [0, "away score must be >= 0"],
        validate: {
          validator: Number.isInteger,
        },
      },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

mongooseSchema.index(
  { tournamentId: 1, venueId: 1, date: 1, start_time: 1 },
  { unique: true, sparse: true }
);
mongooseSchema.index({ tournamentId: 1, round: 1, leg: 1 });
mongooseSchema.index(
  { tournamentId: 1, round: 1, leg: 1, homeTeamId: 1, awayTeamId: 1 },
  { unique: true, sparse: true }
);

mongooseSchema.plugin(softDeletePlugin);

export const MatchModel = models.Match || model("Match", mongooseSchema);
