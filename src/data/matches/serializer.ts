import { MatchOut, MatchHydratedOut } from "./dto";

/* ───────────────── helpers ───────────────── */

const opt = <T>(v: T | null | undefined): T | undefined =>
  v == null ? undefined : (v as T);

const toIso = (v: any): string | undefined => {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
};

/** Accepts a populated ref or a plain id; returns string id or undefined. */
const idOf = (v: any): string | undefined => {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v._id != null) return String(v._id);
  return String(v); // fallback, e.g. ObjectId
};

/** Convert {_id,name} if populated, else undefined. */
const toNamedRef = (v: any) =>
  v && typeof v === "object" && v._id != null
    ? { _id: String(v._id), name: String(v.name ?? "") }
    : undefined;

/* ───────────────── MatchOut (flat ids) ───────────────── */

export function toMatchOut(doc: any): MatchOut {
  // tolerate both `groupId` and `group` as a populated object
  const groupId = idOf(doc.groupId ?? doc.group);
  const venueId = idOf(doc.venueId ?? doc.venue);

  // tolerate `homeTeamId` as populated or raw id; also accept legacy `homeTeam`
  const homeId = idOf(doc.homeTeamId ?? doc.homeTeam);
  const awayId = idOf(doc.awayTeamId ?? doc.awayTeam);

  return {
    _id: String(doc._id),
    tournamentId: String(doc.tournamentId),

    // optional in schema
    ...(groupId ? { groupId: String(groupId) } : {}),

    round: Number(doc.round),
    leg: Number(doc.leg),

    homeTeamId: String(homeId),
    awayTeamId: String(awayId),

    ...(venueId ? { venueId: String(venueId) } : {}),

    date: opt<string>(toIso(doc.date)),
    start_time: opt<string>(doc.start_time),
    end_time: opt<string>(doc.end_time),

    status: doc.status,
    conflict_reason: opt<string>(doc.conflict_reason),

    homeScore:
      doc.homeScore != null
        ? Number(doc.homeScore)
        : doc.score?.home != null
        ? Number(doc.score.home)
        : undefined,

    awayScore:
      doc.awayScore != null
        ? Number(doc.awayScore)
        : doc.score?.away != null
        ? Number(doc.score.away)
        : undefined,

    createdAt: opt<string>(toIso(doc.createdAt)),
    updatedAt: opt<string>(toIso(doc.updatedAt)),
  };
}

export function toMatchHydratedOut(doc: any): MatchHydratedOut {
  const group = toNamedRef(doc.groupId ?? doc.group);
  const venue = toNamedRef(doc.venueId ?? doc.venue);

  // team can be under `homeTeamId`/`awayTeamId` or legacy `homeTeam`/`awayTeam`
  const home = toNamedRef(doc.homeTeamId ?? doc.homeTeam);
  const away = toNamedRef(doc.awayTeamId ?? doc.awayTeam);

  return {
    _id: String(doc._id),
    tournamentId: String(doc.tournamentId),

    group: group ?? null,
    venue: venue ?? null,

    round: Number(doc.round),
    leg: Number(doc.leg),

    // if not populated, fall back to id with empty name
    homeTeam:
      home ??
      ({
        _id: String(idOf(doc.homeTeamId ?? doc.homeTeam) ?? ""),
        name: "",
      } as MatchHydratedOut["homeTeam"]),
    awayTeam:
      away ??
      ({
        _id: String(idOf(doc.awayTeamId ?? doc.awayTeam) ?? ""),
        name: "",
      } as MatchHydratedOut["awayTeam"]),

    date: opt<string>(toIso(doc.date)),
    start_time: opt<string>(doc.start_time),
    end_time: opt<string>(doc.end_time),

    status: doc.status,
    conflict_reason: opt<string>(doc.conflict_reason),

    // build score object only when we have at least one side
    ...(doc.score || doc.homeScore != null || doc.awayScore != null
      ? {
          score: {
            home:
              doc.score?.home != null
                ? Number(doc.score.home)
                : doc.homeScore != null
                ? Number(doc.homeScore)
                : null,
            away:
              doc.score?.away != null
                ? Number(doc.score.away)
                : doc.awayScore != null
                ? Number(doc.awayScore)
                : null,
          },
        }
      : {}),

    createdAt: opt<string>(toIso(doc.createdAt)),
    updatedAt: opt<string>(toIso(doc.updatedAt)),
  };
}
