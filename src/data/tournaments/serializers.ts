// src/data/tournaments/serializers.ts
import type { TournamentDb } from "./schema";
import { TournamentOut, SchedulerSettingsShared, type Tournament } from "./dto";

/** One doc ➜ DTO */
export function toTournamentOut(row: TournamentDb & { _id: any }): Tournament {
  const dto = {
    _id: String(row._id),
    name: row.name,
    startDate: new Date(row.startDate),
    endDate: new Date(row.endDate),
    // Ensure defaults if settings missing in DB
    settings: SchedulerSettingsShared.parse(row.settings ?? {}),
  };
  return TournamentOut.parse(dto);
}

/** Many docs ➜ DTOs */
export function toTournamentOutMany(
  rows: Array<TournamentDb & { _id: any }>
): Tournament[] {
  return rows.map(toTournamentOut);
}
