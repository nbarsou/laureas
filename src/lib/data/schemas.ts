import { z } from "zod";
import { Types } from "mongoose";

/* ----------- Helpers ------------- */
export const zObjectId = z
  .string()
  .refine(Types.ObjectId.isValid, { message: "Invalid ObjectId" })
  .transform((v) => new Types.ObjectId(v));

const timestampFields = {
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
};

/** ---------- tournaments ---------- */
export const TournamentSchema = z.object({
  _id: zObjectId.optional(),
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  ...timestampFields,
});
export type Tournament = z.infer<typeof TournamentSchema>;

/** ---------- teams ---------- */
export const TeamSchema = z.object({
  _id: zObjectId.optional(),
  tournamentId: zObjectId,
  name: z.string(),
  managers: z.array(z.email()).default([]),
  ...timestampFields,
});
export type Team = z.infer<typeof TeamSchema>;

/** ---------- players ---------- */
export const PlayerSchema = z.object({
  _id: zObjectId.optional(),
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.number().int().positive().max(99),
  ...timestampFields,
});
export type Player = z.infer<typeof PlayerSchema>;

/** ---------- venues ---------- */
export const VenueSchema = z.object({
  _id: zObjectId.optional(),
  tournamentId: zObjectId,
  name: z.string(),
  address: z.string(),
  location: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }),
  ...timestampFields,
});
export type Venue = z.infer<typeof VenueSchema>;

/** ---------- matches ---------- */
export const MatchSchema = z.object({
  _id: zObjectId.optional(),
  tournamentId: zObjectId,
  round: z.number().int().positive(),
  homeTeamId: zObjectId,
  awayTeamId: zObjectId,
  score: z
    .object({
      home: z.number().int().nonnegative(),
      away: z.number().int().nonnegative(),
    })
    .optional(),
  stats: z.record(z.string(), z.unknown()).optional(),
  ...timestampFields,
});
export type Match = z.infer<typeof MatchSchema>;
