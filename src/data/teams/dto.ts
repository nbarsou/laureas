import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

/** Create / Update input (FormData-friendly via z.coerce.*) */
export const TeamCreateIn = z.object({
  tournamentId: zObjectId,
  groupId: zObjectId.optional(), // not required in Mongoose schema
  name: z.string().min(1, "Name is required"),
  manager: z.string().email("Invalid email"),
});
export type TeamCreateIn = z.infer<typeof TeamCreateIn>;

export const TeamUpdateIn = TeamCreateIn.partial().extend({
  _id: zObjectId.optional(), // only needed when update comes from a form
});
export type TeamUpdateIn = z.infer<typeof TeamUpdateIn>;

/** What UI gets back */
export const TeamOut = z.object({
  _id: z.string(),
  tournamentId: z.string(),
  groupId: z.string().optional(),
  name: z.string(),
  manager: z.string().email(),
  // If you want to include availability in responses, add it here later.
});

export type TeamOut = z.infer<typeof TeamOut>;

export const TeamGroupNameOut = TeamOut.partial().extend({
  groupName: z.string().optional(), // only needed when update comes from a form
});

export type TeamGroupNameOut = z.infer<typeof TeamGroupNameOut>;
