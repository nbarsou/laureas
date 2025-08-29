// scripts/runSeed.ts
import "dotenv/config";
import { seedTournament } from "@/lib/scripts/seedTournament";
import { logger } from "@/lib/logging";

(async () => {
  const res = await seedTournament({
    ownerId: process.env.OWNER_ID!,
    tournamentName: process.env.TOURNAMENT_NAME ?? "Autumn Cup",
    startDate: process.env.START_DATE ?? new Date(),
    endDate:
      process.env.END_DATE ?? new Date(Date.now() + 35 * 24 * 3600 * 1000),
    groups: Number(process.env.GROUPS ?? 4),
    teamsPerGroup: Number(process.env.TEAMS_PER_GROUP ?? 4),
    playersPerTeam: Number(process.env.PLAYERS_PER_TEAM ?? 8),
    createPlayers:
      (process.env.CREATE_PLAYERS ?? "true").toLowerCase() === "true",
    doubleRound: (process.env.DOUBLE_ROUND ?? "false").toLowerCase() === "true",
    allowSameDayPlay:
      (process.env.ALLOW_SAME_DAY ?? "false").toLowerCase() === "true",
  });

  logger.info("Seed complete", res);
  process.exit(0);
})();
