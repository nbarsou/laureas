// src/data/matches/dto.ts
import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

// HH:MM (00–23):(00–59)
export const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ---------- Create ----------
export const MatchCreateIn = z.object({
  tournamentId: zObjectId,
  groupId: zObjectId.optional(), // optional in schema
  round: z.number().int().min(1),
  leg: z.number().int().min(1).max(2).default(1),

  homeTeamId: zObjectId,
  awayTeamId: zObjectId,

  venueId: zObjectId.optional(),
  date: z.string().optional().nullable(), // ISO date / datetime string
  start_time: z.string().regex(HHMM).optional().nullable(),
  end_time: z.string().regex(HHMM).optional().nullable(),

  status: z
    .enum(["pending", "scheduled", "completed", "canceled"])
    .default("pending"),

  conflict_reason: z.string().max(255).optional(),

  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
});
export type MatchCreateIn = z.infer<typeof MatchCreateIn>;

// ---------- Update ----------
export const MatchUpdateIn = MatchCreateIn.partial().extend({
  _id: zObjectId,
});
export type MatchUpdateIn = z.infer<typeof MatchUpdateIn>;

// ---------- Flat OUT (ids only) ----------
export const MatchOut = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,
  groupId: zObjectId.optional(), // stays optional to mirror schema
  round: z.number().int().min(1),
  leg: z.number().int().min(1).max(2),

  homeTeamId: zObjectId,
  awayTeamId: zObjectId,
  venueId: zObjectId.optional(),

  date: z.string().optional().nullable(),
  start_time: z.string().regex(HHMM).optional().nullable(),
  end_time: z.string().regex(HHMM).optional().nullable(),

  status: z.enum(["pending", "scheduled", "completed", "canceled"]),
  conflict_reason: z.string().max(255).optional(),

  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),

  // timestamps added by Mongoose
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type MatchOut = z.infer<typeof MatchOut>;

// ---------- HYDRATED OUT (with names) ----------
const NamedRef = z.object({
  _id: zObjectId,
  name: z.string(),
});

export const MatchHydratedOut = z.object({
  _id: zObjectId,
  tournamentId: zObjectId,

  group: NamedRef.optional().nullable(), // populated Group (optional)
  venue: NamedRef.optional().nullable(), // populated Venue (optional)

  round: z.number().int().min(1),
  leg: z.number().int().min(1).max(2),

  homeTeam: NamedRef, // populated Team (required)
  awayTeam: NamedRef, // populated Team (required)

  date: z.string().optional().nullable(),
  start_time: z.string().regex(HHMM).optional().nullable(),
  end_time: z.string().regex(HHMM).optional().nullable(),

  status: z.enum(["pending", "scheduled", "completed", "canceled"]),
  conflict_reason: z.string().max(255).optional().nullable(),

  // convenience score object for UIs
  score: z
    .object({
      home: z.number().int().min(0).optional().nullable(),
      away: z.number().int().min(0).optional().nullable(),
    })
    .optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type MatchHydratedOut = z.infer<typeof MatchHydratedOut>;
