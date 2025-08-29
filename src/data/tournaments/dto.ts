// src/data/tournaments/dto.ts
import { z } from "zod";
import { zFormBoolean, zObjectId } from "@/data/_helpers";

/** ---------- Zod helpers ---------- */
const NonEmptyString = z.string().trim().nonempty("This field is required.");

const CoercedDate = z.coerce.date("Invalid date.");

/** ---------- Create / Update input ---------- */
export const TournamentCreateIn = z
  .object({
    ownerId: zObjectId.describe("Owner").or(
      z.string().transform(() => {
        // Let server set ownerId; client can't.
        // This branch prevents confusing client-side messages if left empty.
        throw new z.ZodError([
          { code: "custom", message: "Missing owner.", path: ["ownerId"] },
        ]);
      })
    ),
    name: NonEmptyString.describe("Tournament name").refine(
      (v) => v.length >= 2,
      { message: "Name must be at least 2 characters long." }
    ),
    startDate: CoercedDate.describe("Start date"),
    endDate: CoercedDate.describe("End date"),
    roundRobinDouble: zFormBoolean.default(false),
    allowSameDayPlay: zFormBoolean.default(false),
    groupsEnabled: zFormBoolean.default(false),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be earlier or the same as start date.",
    path: ["endDate"],
  });

export type TournamentCreateIn = z.infer<typeof TournamentCreateIn>;

export const TournamentUpdateIn = TournamentCreateIn.partial().extend({
  _id: zObjectId.optional(),
});
export type TournamentUpdateIn = z.infer<typeof TournamentUpdateIn>;

/** ---------- Out (what UI gets) ---------- */
export const TournamentOut = z.object({
  _id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  startDate: z.string(), // ISO string for UI
  endDate: z.string(), // ISO string for UI
  roundRobinDouble: z.boolean(),
  allowSameDayPlay: z.boolean(),
  groupsEnabled: z.boolean(),
});

export type TournamentOut = z.infer<typeof TournamentOut>;

/** ---------- Serializer (DB -> Out) ---------- */
export function toTournamentOut(row: Record<string, any>): TournamentOut {
  const dto = {
    _id: String(row._id),
    ownerId: String(row.ownerId),
    name: String(row.name),
    startDate: new Date(row.startDate).toISOString(),
    endDate: new Date(row.endDate).toISOString(),
    roundRobinDouble: Boolean(row.roundRobinDouble),
    allowSameDayPlay: Boolean(row.allowSameDayPlay),
    groupsEnabled: Boolean(row.groupsEnabled),
  };
  return TournamentOut.parse(dto);
}
