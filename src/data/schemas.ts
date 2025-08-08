import { z } from "zod";
import { Types } from "mongoose";

/* ----------- Helpers ------------- */
const zObjectId = z
  .string()
  .refine(Types.ObjectId.isValid, { message: "Invalid ObjectId" })
  .transform((v) => new Types.ObjectId(v));

const timestampFields = {
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
};

/** ---------- tournaments ---------- */
const TournamentSchema = z.object({
  _id: zObjectId,
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  ...timestampFields,
});
type TournamentInput = z.infer<typeof TournamentSchema>;

/** ---------- teams ---------- */
const TeamSchema = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,
  name: z.string(),
  managers: z.array(z.email()).default([]),
  ...timestampFields,
});
type TeamInput = z.infer<typeof TeamSchema>;

/** ---------- players ---------- */
const PlayerSchema = z.object({
  _id: zObjectId.optional(),
  teamId: zObjectId,
  firstName: z.string(),
  lastName: z.string(),
  number: z.number().int().positive().max(99),
  ...timestampFields,
});
type Player = z.infer<typeof PlayerSchema>;

/** ---------- venues ---------- */
const VenueSchema = z.object({
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
type Venue = z.infer<typeof VenueSchema>;

/** ---------- matches ---------- */
const MatchSchema = z.object({
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
type Match = z.infer<typeof MatchSchema>;
