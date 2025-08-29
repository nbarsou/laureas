import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "../_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { VENUE_VERSION } from "./version";

/* ---------- Mongoose schema ---------- */
const VenueSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      index: true,
      required: true,
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
      enum: ["grass", "turf", "indoor", "other"],
      default: "other",
      index: true,
    },
  },
  { timestamps: true }
);

VenueSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
VenueSchema.plugin(softDeletePlugin);
VenueSchema.plugin(versionSemverPlugin, { defaultVersion: VENUE_VERSION });

export const VenueModel = models.Venue || model("Venue", VenueSchema);
