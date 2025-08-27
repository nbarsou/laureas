// lib/scheduling/scheduler.ts
import type {
  ConcreteSlot,
  Pairing,
  Ctx,
  HardConstraint,
  SoftConstraint,
} from "./types";
import { MatchModel } from "@/data/matches/schema";

// choose best slot by soft score among those that pass hard constraints
function chooseSlot(
  ctx: Ctx,
  m: Pairing,
  slots: ConcreteSlot[],
  hard: HardConstraint[],
  soft: SoftConstraint[]
): ConcreteSlot | null {
  let best: { s: ConcreteSlot; score: number } | null = null;
  for (const s of slots) {
    const violated = hard.find((h) => h(ctx, m, s) !== true);
    if (violated) continue;
    const score = soft.reduce((acc, f) => acc + f(ctx, m, s), 0);
    if (!best || score > best.score) best = { s, score };
  }
  return best?.s ?? null;
}

export async function scheduleGreedy(
  ctx: Ctx,
  matches: Pairing[],
  slots: ConcreteSlot[],
  opts?: { sortBy?: "round" | "degree" },
  hard: HardConstraint[] = [],
  soft: SoftConstraint[] = []
) {
  const H = hard.length ? hard : []; // allow injection
  const S = soft.length ? soft : [];

  // sort matches: earlier rounds first; (optional) prioritize high-degree teams
  const ordered = [...matches].sort(
    (a, b) => a.round - b.round || a.leg - b.leg
  );

  let scheduled = 0;
  const conflicts: Array<{ matchKey: string; reason: string }> = [];

  for (const m of ordered) {
    const s = chooseSlot(ctx, m, slots, H, S);
    if (!s) {
      conflicts.push({
        matchKey: `${m.home}-${m.away}-${m.round}-${m.leg}`,
        reason: "no feasible slot",
      });
      continue;
    }

    // apply in-memory locks
    const vKey = `${s.venueId}-${s.dateISO}-${s.start_time}`;
    const aKey = `${m.home}-${s.dateISO}-${s.start_time}`;
    const bKey = `${m.away}-${s.dateISO}-${s.start_time}`;
    ctx.venueTimeUsed.add(vKey);
    ctx.teamAtTime.add(aKey);
    ctx.teamAtTime.add(bKey);
    if (ctx.mode === "spread") {
      ctx.teamAtDay.add(`${m.home}-${s.dateISO}`);
      ctx.teamAtDay.add(`${m.away}-${s.dateISO}`);
    }

    // idempotent upsert on the natural key (round/leg/home/away)
    await MatchModel.updateOne(
      {
        tournamentId: ctx.tournamentId, // ⬅ use ctx instead of (m as any)
        round: m.round,
        leg: m.leg,
        homeTeamId: m.home,
        awayTeamId: m.away,
      },
      {
        $set: {
          status: "scheduled",
          venueId: s.venueId,
          date: new Date(`${s.dateISO}T12:00:00.000Z`),
          start_time: s.start_time,
          end_time: s.end_time,
        },
        $setOnInsert: {
          tournamentId: ctx.tournamentId, // ⬅ use ctx here too
          round: m.round,
          leg: m.leg,
          homeTeamId: m.home,
          awayTeamId: m.away,
        },
      },
      { upsert: true }
    );

    scheduled++;
  }

  return { scheduled, conflicts };
}
