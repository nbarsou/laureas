// lib/scheduling/roundRobin.ts
import { Types } from "mongoose";
import type { Pairing, ObjId } from "./types";

const BYE = new Types.ObjectId("000000000000000000000000");

export function generateRoundRobin(teams: ObjId[], double: boolean): Pairing[] {
  const ids = [...teams];
  if (ids.length % 2 === 1) ids.push(BYE);
  const rounds = ids.length - 1;
  const half = ids.length / 2;

  let left = ids.slice(0, half);
  let right = ids.slice(half).reverse();

  const out: Pairing[] = [];
  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = left[i],
        b = right[i];
      if (a.equals(BYE) || b.equals(BYE)) continue;
      const homeFirst = r % 2 === 1;
      out.push({
        round: r,
        leg: 1 as 1, // << narrow to literal 1
        home: homeFirst ? a : b,
        away: homeFirst ? b : a,
      });
      if (double) {
        out.push({
          round: r,
          leg: 2 as 2, // << narrow to literal 2
          home: homeFirst ? b : a,
          away: homeFirst ? a : b,
        });
      }
    }
    const fixed = left[0];
    const moved = left.pop()!;
    left = [fixed, right[0], ...left.slice(1)];
    right = right.slice(1).concat(moved);
  }
  return out.sort((a, b) => a.round - b.round || a.leg - b.leg);
}

export function generateByGroups(
  groupedTeams: Map<string, ObjId[]>,
  double: boolean
): Pairing[] {
  const all: Pairing[] = [];
  for (const [gid, list] of groupedTeams) {
    const ps = generateRoundRobin(list, double).map((p) => ({
      ...p,
      groupId: new Types.ObjectId(gid),
    }));
    all.push(...ps);
  }
  return all;
}
