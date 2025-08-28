import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

export const GroupCreateIn = z.object({
  tournamentId: zObjectId,
  name: z.string().min(1, "Name is required").max(60),
});

export type GroupCreateIn = z.infer<typeof GroupCreateIn>;
// For PATCH/PUT
export const GroupUpdateIn = GroupCreateIn.partial().extend({
  _id: zObjectId,
});

export type GroupUpdateIn = z.infer<typeof GroupUpdateIn>;

// What you return to the UI (ids as strings)
export const GroupOut = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  name: z.string(),
});

export type GroupOut = z.infer<typeof GroupOut>;
