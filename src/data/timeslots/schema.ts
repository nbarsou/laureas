// data/timeslots/schema.ts
import { z } from "zod";
import { model, models, Schema } from "mongoose";
import { zObjectId } from "@/data/_helpers";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { VERSIONS } from "../version";

/* ---------- helpers ---------- */
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const zHHMM = z.string().regex(HHMM, "Expected time in HH:mm (00:00–23:59)");

const zDOW = z
  .number()
  .int()
  .min(0, "day_of_week must be 0..6 (Sun..Sat)")
  .max(6, "day_of_week must be 0..6 (Sun..Sat)");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/* ---------- Zod schema ---------- */
export const TimeslotCreate = z.object({
  venue_id: zObjectId, // reference to Venue
  day_of_week: zDOW, // 0=Sun ... 6=Sat
  start_time: zHHMM,
  end_time: zHHMM,
  timezone: z.string().min(1).default("America/Mexico_City"),
  is_active: z.boolean().default(true),
  label: z.string().max(80).optional(), // e.g., "Prime Slot", "Youth"
});
export const TimeslotUpdate = TimeslotCreate.partial().extend({
  _id: zObjectId,
});
export const TimeslotOutput = TimeslotCreate.extend({
  _id: z.string(),
  venue_id: z.string(), // reference to Venue
  day_of_week: zDOW, // 0=Sun ... 6=Sat
  start_time: zHHMM,
  end_time: zHHMM,
  timezone: z.string().min(1).default("America/Mexico_City"),
  is_active: z.boolean().default(true),
  label: z.string().max(80).optional(), // e.g., "Prime Slot", "Youth"
});

export type Timeslot = z.infer<typeof TimeslotOutput>;

/* ---------- Mongoose schema ---------- */
const mongooseSchema = new Schema(
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
    is_active: { type: Boolean, default: true, index: true },
    label: { type: String, maxlength: 80 },
  },
  { timestamps: true }
);

/* Validate start < end */
mongooseSchema.pre("validate", function (next) {
  // @ts-ignore
  const start = toMinutes(this.start_time);
  // @ts-ignore
  const end = toMinutes(this.end_time);
  if (!(start < end)) {
    return next(new Error("end_time must be greater than start_time"));
  }
  next();
});

mongooseSchema.index(
  { venue_id: 1, day_of_week: 1, start_time: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.plugin(versionSemverPlugin, {
  defaultVersion: VERSIONS.timeslots,
});

export const TimeslotModel =
  models.Timeslot || model("Timeslot", mongooseSchema);
