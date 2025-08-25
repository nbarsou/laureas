// data/players/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { zObjectId } from "@/data/_helpers";
import { softDeletePlugin } from "@/data/softDelete";

export const PlayerCreate = z.object({
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.coerce.number().int().positive().max(99),
});

export const PlayerUpdate = PlayerCreate.partial().extend({
  _id: zObjectId,
});

export const PlayerOut = z.object({
  _id: z.string(),
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.number().int().min(1).max(99),
});

export type Player = z.infer<typeof PlayerOut>;

const mongooseSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    number: {
      type: Number,
      required: true,
      min: [1, "number must be >= 1"],
      max: [99, "number must be <= 99"],
      validate: {
        validator: Number.isInteger,
      },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

mongooseSchema.index(
  { teamId: 1, number: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);

export const PlayerModel = models.Player || model("Player", mongooseSchema);
