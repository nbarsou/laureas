// app/players/[id]/PlayerCard.tsx
import { fetchPlayerById } from "@/data/players/service";
import Link from "next/link";

type Props = {
  id: string;
};

export default async function PlayerCard({ id }: Props) {
  const player = await fetchPlayerById(id);

  if (!player) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-sm text-gray-600">
        <div className="mb-2 text-base font-semibold text-gray-800">Player</div>
        <div className="italic">No player found for id: {id}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Player Profile</h2>
        <span className="text-xs uppercase text-gray-500">Wireframe</span>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-gray-300 p-4">
          <div className="mb-1 text-xs uppercase text-gray-500">Name</div>
          <div className="text-lg font-medium">
            {player.firstName} {player.lastName}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-gray-300 p-3">
              <div className="text-xs uppercase text-gray-500">Team ID</div>
              <div className="font-mono text-gray-800">
                {String(player.teamId)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-300 p-3">
              <div className="text-xs uppercase text-gray-500">Number</div>
              <div className="text-2xl font-semibold">{player.number}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-gray-300 p-3">
              <div className="text-xs uppercase text-gray-500">Created</div>
              <div className="font-mono text-gray-800">
                {"createdAt" in player && player.createdAt
                  ? new Date(player.createdAt as any).toLocaleString()
                  : "—"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-300 p-3">
              <div className="text-xs uppercase text-gray-500">Updated</div>
              <div className="font-mono text-gray-800">
                {"updatedAt" in player && player.updatedAt
                  ? new Date(player.updatedAt as any).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Jersey / Number Block */}
        <div className="flex items-center justify-center rounded-xl border border-gray-300 p-4">
          <div className="flex h-36 w-28 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
            <span className="text-4xl font-bold">{player.number}</span>
          </div>
        </div>
      </div>

      {/* Stats Placeholder */}
      <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 p-4">
        <div className="mb-3 text-sm font-semibold tracking-wide text-gray-700">
          Stats (placeholder)
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Matches", value: "—" },
            { label: "Goals", value: "—" },
            { label: "Assists", value: "—" },
            { label: "Cards", value: "—" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-gray-300 p-3 text-center"
            >
              <div className="text-xs uppercase text-gray-500">{s.label}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Hook your real stats here later (e.g., from a{" "}
          <code>PlayerStatsModel</code> or an aggregation).
        </div>
      </div>

      {/* Actions (optional placeholders) */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-black bg-transparent px-3 py-1.5 text-sm"
        >
          Edit
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-black bg-transparent px-3 py-1.5 text-sm"
        >
          Delete
        </button>
        <Link
          href="/tournament"
          className="cursor-pointer rounded-lg border border-black bg-transparent px-3 py-1.5 text-sm"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
