// src/data/tournaments/schema.ts
import { Schema, model, models, InferSchemaType, Model } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";

const SchedulerSettingsMongoose = new Schema({
  schedulerMode: {
    type: String,
    enum: ["spread", "compressed"],
    default: "compressed",
  },
  doubleRoundRobin: { type: Boolean, default: false },
  minGapMinutesSameDay: { type: Number, default: 60 },
  maxBacktracks: { type: Number, default: 400 },
  balancePreferredStarts: { type: Boolean, default: true },
  allowSameDayDoubleHeader: { type: Boolean, default: true },
  // ✅ Added fields
  groupsEnabled: { type: Boolean, default: false },
  groupsMode: {
    type: String,
    enum: ["manual", "auto"],
    default: "manual",
  },
});

/* Mongoose schema/model */
const MSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    settings: SchedulerSettingsMongoose,
    default: {},
  },
  { timestamps: true }
);

MSchema.plugin(softDeletePlugin);
MSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export type TournamentDb = InferSchemaType<typeof MSchema>; // no need to add _id manually here

export type TournamentModelType = Model<TournamentDb>;

export const TournamentModel: TournamentModelType =
  (models.Tournament as TournamentModelType | undefined) ??
  model<TournamentDb>("Tournament", MSchema);
