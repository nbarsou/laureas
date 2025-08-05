import { Schema, model, models, InferSchemaType } from "mongoose";
import { ObjectId } from "./_helpers";

const VenueSchema = new Schema(
  {
    tournamentId: { type: ObjectId, ref: "Tournament", required: true },
    name: { type: String, required: true },
    address: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [lng,lat]
    },
  },
  { timestamps: true }
);

export type VenueDoc = InferSchemaType<typeof VenueSchema>;
export const Venue = models.Venue || model("Venue", VenueSchema);
