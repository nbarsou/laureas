import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "../_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { TIMESLOT_VERSION } from "./version";

// TOOD: add tournament id, check in auth.

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const TimeslotSchema = new Schema(
  {
    venue_id: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
      index: true,
    },
    day_of_week: { type: Number, required: true, min: 0, max: 6, index: true },
    start_time: {
      type: String,
      required: true,
      match: HHMM,
    },
    end_time: {
      type: String,
      required: true,
      match: HHMM,
    },
    timezone: {
      type: String,
      required: true,
      default: "America/Mexico_City",
    },
    label: { type: String, maxlength: 80 },
  },
  { timestamps: true }
);

/* Validate start < end */
TimeslotSchema.pre("validate", function (next) {
  // @ts-ignore
  const start = toMinutes(this.start_time);
  // @ts-ignore
  const end = toMinutes(this.end_time);
  if (!(start < end)) {
    return next(new Error("end_time must be greater than start_time"));
  }
  next();
});

TimeslotSchema.index(
  { venue_id: 1, day_of_week: 1, start_time: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

TimeslotSchema.plugin(softDeletePlugin);
TimeslotSchema.plugin(versionSemverPlugin, {
  defaultVersion: TIMESLOT_VERSION,
});

export const TimeslotModel =
  models.Timeslot || model("Timeslot", TimeslotSchema);
