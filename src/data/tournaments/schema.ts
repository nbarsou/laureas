// data/tournaments/schema.ts
import { z } from "zod";
import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { zObjectId } from "@/data/_helpers";
import { softDeletePlugin } from "@/data/softDelete";

export const TournamentSchema = z
  .object({
    _id: zObjectId,
    name: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    path: ["endDate"],
    message: "End date must be after start date",
  });

export type Tournament = z.infer<typeof TournamentSchema>;

// Schema is strongly typed
const SchedulerSettingsSchema = new Schema(
  {
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

    groupsEnabled: { type: Boolean, default: false },
    groupsMode: { type: String, enum: ["random", "manual"], default: "manual" },
    groupsCount: { type: Number, min: 1 },
  },
  { _id: false }
);
// Create the tournament Schema
const mongooseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1 },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    settings: { type: SchedulerSettingsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

// Add soft delete plugin and create isDeleted index. 
mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Strong TS doc type inferred from the schema, with explicit _id
// Infer the type and add the _id 
export type TournamentDb = InferSchemaType<typeof mongooseSchema> & {
  _id: Types.ObjectId;
};

// Strongly-typed Model (export it with the _id baked in)
export type TournamentModelType = Model<TournamentDb>;
export const TournamentModel =
  (models.Tournament as TournamentModelType | undefined) ??
  model<TournamentDb>("Tournament", mongooseSchema);
