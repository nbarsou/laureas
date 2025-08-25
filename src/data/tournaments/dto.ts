// src/data/tournaments/dto.ts
import { z } from "zod";
import { zObjectId } from "@/data/_helpers";

/** Settings (keep in sync with your mongoose schema) */
export const SchedulerSettingsShared = z.object({
  schedulerMode: z.enum(["spread", "compressed"]).default("compressed"),
  doubleRoundRobin: z.boolean().default(false),
  minGapMinutesSameDay: z.number().int().nonnegative().default(60),
  maxBacktracks: z.number().int().nonnegative().default(400),
  balancePreferredStarts: z.boolean().default(true),
  allowSameDayDoubleHeader: z.boolean().default(true),

  groupsEnabled: z.boolean().default(false),
  groupsMode: z.enum(["manual", "auto"]).default("manual"),
});
export type SchedulerSettings = z.infer<typeof SchedulerSettingsShared>;
export const SCHEDULER_DEFAULTS: SchedulerSettings =
  SchedulerSettingsShared.parse({});

/** Create (server) — coerce dates, validate ownerId, include settings */
export const TournamentCreate = z
  .object({
    name: z.string().min(1, "Name is required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    ownerId: zObjectId,
    settings: SchedulerSettingsShared.default(SCHEDULER_DEFAULTS),
  })
  .refine((d) => d.endDate >= d.startDate, {
    path: ["endDate"],
    message: "End date must be after start date",
  });

/** Update (server) — partial create + _id */
export const TournamentUpdate = TournamentCreate.partial()
  .extend({ _id: zObjectId })
  .refine((d) => (d.startDate && d.endDate ? d.endDate >= d.startDate : true), {
    path: ["endDate"],
    message: "End date must be after start date",
  });

/** Out DTO (what UI consumes) — now includes settings */
export const TournamentOut = z.object({
  _id: z.string(),
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  settings: SchedulerSettingsShared, // expose settings to the client
});
export type Tournament = z.infer<typeof TournamentOut>;
