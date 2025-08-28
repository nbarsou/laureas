import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

export const PlayerCreateIn = z.object({
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.coerce.number().int().positive().max(99),
});
export type PlayerCreateIn = z.infer<typeof PlayerCreateIn>;

export const PlayerUpdateIn = PlayerCreateIn.partial().extend({
  _id: zObjectId,
});

export type PlayerUpdateIn = z.infer<typeof PlayerUpdateIn>;

export const PlayerOut = z.object({
  _id: z.string(),
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.number().int().min(1).max(99),
});

export type PlayerOut = z.infer<typeof PlayerOut>;
