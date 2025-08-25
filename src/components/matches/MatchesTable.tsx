// /components/matches/MatchesTable.tsx (Server Component)

import * as React from "react";
import Link from "next/link";
import {
  fetchMatchesByTournamentIdHydrated,
  type HydratedMatch,
} from "@/data/matches/service";

function fmtDate(date?: string | null) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      weekday: "short", // or "long" for full day names
      year: "numeric",
      month: "short",
      day: "numeric", // "2-digit" → "05", "numeric" → "5"
    });
  } catch {
    return date;
  }
}
function fmtTime(hhmm?: string | null) {
  return hhmm ?? "—";
}

function fmtScore(s?: HydratedMatch["score"]) {
  if (!s || (s.home == null && s.away == null)) return "—";
  const h = s.home ?? 0;
  const a = s.away ?? 0;
  return `${h} – ${a}`;
}

export default async function MatchesTable({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const rows = await fetchMatchesByTournamentIdHydrated(tournamentId);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-sm text-gray-400">
            {/* <th className="px-3 py-2">Round</th> */}
            {/* <th className="px-3 py-2">Leg</th> */}
            <th className="px-3 py-2">Group</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Venue</th>
            <th className="px-3 py-2">Start</th>
            <th className="px-3 py-2">End</th>
            <th className="px-3 py-2">Home</th>
            <th className="px-3 py-2">Away</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m._id} className="bg-white/5 hover:bg-white/10 transition">
              {/* <td className="px-3 py-2">{m.round}</td> */}
              {/* <td className="px-3 py-2">{m.leg}</td> */}
              <td className="px-3 py-2">{m.group?.name ?? "—"}</td>
              <td className="px-3 py-2">{fmtDate(m.date)}</td>
              <td className="px-3 py-2">{m.venue?.name ?? "—"}</td>
              <td className="px-3 py-2">{fmtTime(m.start_time)}</td>
              <td className="px-3 py-2">{fmtTime(m.end_time)}</td>
              <td className="px-3 py-2 font-medium">{m.homeTeam.name}</td>
              <td className="px-3 py-2 font-medium">{m.awayTeam.name}</td>
              <td className="px-3 py-2 capitalize">{m.status}</td>
              <td className="px-3 py-2">{fmtScore(m.score)}</td>
              <td className="px-3 py-2">
                <div className="flex gap-2 text-sm">
                  <Link href={`./matches/${m._id}`}>View</Link>
                  <Link href={`./matches/${m._id}/edit`}>Edit</Link>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="px-3 py-6 text-center text-sm text-gray-400"
              >
                No matches found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Example usage in a page or layout (Server Component)
// -----------------------------------------------------------------------------
// import MatchesTable from "@/components/matches/MatchesTable";
// export default function Page({ params }: { params: { tid: string } }) {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Matches</h1>
//       <MatchesTable tournamentId={params.tid} />
//     </div>
//   );
// }

// -----------------------------------------------------------------------------
// Notes
// - Uses an aggregation pipeline with $lookup to hydrate only the fields we need (names),
//   keeping the payload small and serializable for Server Components.
// - $project casts ObjectIds to strings so you can safely pass to Client Components later.
// - Filters out soft-deleted documents by default.
// - Sorting prioritizes scheduled date/time, then round/leg.
// - Adjust collection names ("teams", "venues", "groups") if your actual model collection
//   names differ from the default pluralization.
