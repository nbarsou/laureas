// /components/matches/MatchesByDayList.tsx (Server Component)
import * as React from "react";
import Link from "next/link";
import { listMatchesHydrated } from "@/data/matches/service";
import { MatchHydratedOut } from "@/data/matches/dto";

/* --- helpers --- */
// Accept Date | string | null
type DLike = Date | string | null | undefined;

function toLocalYMD(dLike: DLike): string | null {
  if (!dLike) return null;
  const d = typeof dLike === "string" ? new Date(dLike) : dLike;
  if (!(d instanceof Date) || isNaN(d.getTime())) return null;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // local YYYY-MM-DD
}

function dayKey(date?: DLike) {
  return toLocalYMD(date) ?? "__UNSCHEDULED__";
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function labelForDay(key: string) {
  if (key === "__UNSCHEDULED__") return "Unscheduled";
  const today = new Date();
  const parts = key.split("-").map((n) => parseInt(n, 10));
  const d = new Date(parts[0], parts[1] - 1, parts[2]); // local midnight
  const diffDays = Math.floor(
    (stripTime(d).getTime() - stripTime(today).getTime()) / 86_400_000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtKickoff(date?: DLike, hhmm?: string | null) {
  if (!date || !hhmm) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtScore(s?: MatchHydratedOut["score"]) {
  if (!s || (s.home == null && s.away == null)) return null;
  return `${s.home ?? 0} – ${s.away ?? 0}`;
}

export default async function MatchesByDayList({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const rows = await listMatchesHydrated(tournamentId);

  if (!rows) {
    return (
      <div className="px-3 py-6 text-center text-sm text-gray-400">
        No matches found.
      </div>
    );
  }

  // Group by YYYY-MM-DD (or UNSCHEDULED)
  const buckets = new Map<string, MatchHydratedOut[]>();
  for (const m of rows) {
    const key = dayKey(m.date);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(m);
  }

  // Sort day keys ascending, with UNSCHEDULED last
  const keys = Array.from(buckets.keys()).sort((a, b) => {
    if (a === "__UNSCHEDULED__") return 1;
    if (b === "__UNSCHEDULED__") return -1;
    return a.localeCompare(b);
  });

  if (keys.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-gray-400">
        No matches found.
      </div>
    );
  }

  return (
    <div className="w-full">
      {keys.map((k) => {
        const list = buckets.get(k)!;

        return (
          <section key={k} className="mb-6">
            {/* Day header bar */}
            <div className="mx-2 mb-2 rounded-lg bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-semibold">
              {labelForDay(k)}
            </div>

            <ul className="mx-1 divide-y divide-gray-200 rounded-xl bg-white shadow-sm">
              {list.map((m) => {
                const score = fmtScore(m.score);
                const kickoff = fmtKickoff(m.date, m.start_time);
                const center = score ?? kickoff ?? "—";
                const isFinal =
                  !!score &&
                  (m.status?.toLowerCase().includes("final") ||
                    m.status?.toUpperCase() === "FT");

                return (
                  <li key={m._id} className="hover:bg-gray-50 transition">
                    <Link
                      href={`./matches/${m._id}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2"
                    >
                      {/* Left: tiny status pill (FT / LIVE / etc.) */}
                      <span
                        className={[
                          "inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-xs font-semibold",
                          isFinal
                            ? "bg-gray-200 text-gray-700"
                            : m.status?.toLowerCase() === "live"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600",
                        ].join(" ")}
                        title={m.status ?? ""}
                      >
                        {isFinal
                          ? "FT"
                          : m.status
                          ? m.status.toUpperCase()
                          : " "}
                      </span>

                      {/* Middle: Home  [score/time]  Away */}
                      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="truncate text-right font-medium text-gray-900">
                          {m.homeTeam.name}
                          {m.group?.name ? (
                            <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">
                              {m.group.name}
                            </span>
                          ) : null}
                        </div>

                        <div className="min-w-[64px] text-center text-sm tabular-nums text-gray-900">
                          {center}
                        </div>

                        <div className="truncate font-medium text-gray-900">
                          {m.awayTeam.name}
                        </div>
                      </div>

                      {/* Right: venue (or chevron) */}
                      <div className="ml-2 hidden text-right text-xs text-gray-500 sm:block">
                        {m.venue?.name ?? ""}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
