import { z } from "zod";
import { zObjectId } from "../_helpers";

const SurfaceType = z.enum(["grass", "turf", "indoor", "other"]);

export const VenueCreateIn = z.object({
  tournamentId: zObjectId,
  name: z.string().min(1, "name is required").max(120),
  address: z.string().min(1, "address is required").max(240),
  surface_type: SurfaceType.default("other"),
});

export type VenueCreateIn = z.infer<typeof VenueCreateIn>;

export const VenueUpdateIn = VenueCreateIn.partial().extend({
  _id: zObjectId,
});

export type VenueUpdateIn = z.infer<typeof VenueUpdateIn>;

export const VenueOut = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  name: z.string().min(1).max(120),
  address: z.string().min(1).max(240),
  surface_type: SurfaceType,
});

export type VenueOut = z.infer<typeof VenueOut>;
