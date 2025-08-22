// data/venues/schema.ts
import { z } from "zod";
import { InferSchemaType, Model, model, models, Schema, Types } from "mongoose";
import { softDeletePlugin } from "@/data/softDelete";
import { zObjectId } from "@/data/_helpers";

/* ---------- Enums / helpers ---------- */
export const SurfaceType = z.enum(["grass", "turf", "indoor", "other"]);

/* ---------- Zod schema ---------- */
export const VenueSchema = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,
  name: z.string().min(1, "name is required").max(120),
  address: z.string().min(1, "address is required").max(240),
  surface_type: SurfaceType.default("other"),
});

export type Venue = z.infer<typeof VenueSchema>;

/* ---------- Mongoose schema ---------- */
const mongooseSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      index: true,
      require: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    address: { type: String, required: true, trim: true, maxlength: 240 },
    surface_type: {
      type: String,
      enum: SurfaceType.options,
      default: "other",
      index: true,
    },
  },
  { timestamps: true }
);

mongooseSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);

export type VenueDb = InferSchemaType<typeof mongooseSchema> & {
  _id: Types.ObjectId;
};
export type VenueModelType = Model<VenueDb>;
export const VenueModel =
  (models.Venue as VenueModelType | undefined) ||
  model<VenueDb>("Venue", mongooseSchema);
