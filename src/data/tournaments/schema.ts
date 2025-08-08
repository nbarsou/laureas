// data/tournaments/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { zObjectId } from "@/data/_helpers";

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

const mongooseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const TournamentModel =
  models.Tournament || model("Tournament", mongooseSchema);
