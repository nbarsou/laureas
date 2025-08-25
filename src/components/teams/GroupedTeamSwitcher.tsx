// components/teams/GroupedTeamsSwitcher.tsx (CLIENT)
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EditButton } from "@/components/common/EditButton";
import { DeleteButton } from "@/components/teams/DeleteTeamButton";
import ClickableRow from "@/components/common/ClickableRow";
import React from "react";

type TeamWithGroup = {
  _id: string;
  tournamentId: string;
  groupId?: string;
  name: string;
  manager: string;
};

type Props = {
  tournamentId: string;
  groups: string[]; // includes "__UNGROUPED__" if present
  teamsByGroup: Record<string, TeamWithGroup[]>;
  labels?: { ungrouped?: string };
};

const UNGROUPED = "__UNGROUPED__";
const ALL = "__ALL__" as const;

export default function GroupedTeamsSwitcher({
  tournamentId,
  groups,
  teamsByGroup,
  labels = { ungrouped: "Ungrouped" },
}: Props) {
  const params = useSearchParams();
  const router = useRouter();

  // UI list includes "ALL" first, then each group (UNGROUPED likely last already)
  const groupsForUi = useMemo(() => [ALL, ...groups], [groups]);

  // Initialize from ?group=; accept "all" as alias for ALL
  const raw = params.get("group");
  const initialFromUrl = raw === "all" ? ALL : raw || groupsForUi[0] || ALL;

  const [selected, setSelected] = useState<string>(initialFromUrl);

  useEffect(() => {
    // Keep URL in sync; write "all" for cleaner URLs
    const usp = new URLSearchParams(Array.from(params.entries()));
    if (selected) usp.set("group", selected === ALL ? "all" : selected);
    router.replace(`?${usp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const showingAll = selected === ALL;
  const title =
    selected === UNGROUPED
      ? labels.ungrouped ?? "Ungrouped"
      : selected === ALL
      ? "All groups"
      : selected;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Sticky selector bar (white theme) */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-2">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2">
          {/* Left: Prev */}
          <button
            type="button"
            onClick={() => {
              const i = groupsForUi.indexOf(selected);
              const prev =
                groupsForUi[(i - 1 + groupsForUi.length) % groupsForUi.length];
              setSelected(prev);
            }}
            className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
            aria-label="Previous group"
          >
            ‹
          </button>

          {/* Center: Select (adds ALL option) */}
          <div className="justify-self-center">
            <div className="relative inline-flex">
              <select
                id="group-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="appearance-none bg-white text-gray-900 font-semibold
                           px-3 py-1.5 pr-7 border border-gray-300 rounded-md
                           text-center max-w-[60vw] truncate
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ALL}>All groups</option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g === UNGROUPED ? labels.ungrouped ?? "Ungrouped" : g}
                  </option>
                ))}
              </select>
              {/* caret */}
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700 opacity-80"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </div>
          </div>

          {/* Right: Next */}
          <button
            type="button"
            onClick={() => {
              const i = groupsForUi.indexOf(selected);
              const next = groupsForUi[(i + 1) % groupsForUi.length];
              setSelected(next);
            }}
            className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 justify-self-end"
            aria-label="Next group"
          >
            ›
          </button>
        </div>
      </div>

      {/* Header row (you can remove if not needed) */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <div style={{ flex: 1 }} />
        {/* <- time restriction chips go here later */}
      </div>

      {/* Content */}
      {showingAll ? (
        <AllGroups
          groups={groups}
          teamsByGroup={teamsByGroup}
          labels={labels}
        />
      ) : (
        <GroupTable name={title} teams={teamsByGroup[selected] || []} />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function GroupTable({ name, teams }: { name: string; teams: TeamWithGroup[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Name", "Manager", ""].map((h) => (
            <th
              key={h}
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "6px",
                fontWeight: 600,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {teams.map((t) => (
          <ClickableRow
            key={t._id}
            href={`/tournament/${t.tournamentId}/teams/${t._id}`}
          >
            <td style={cellStyle}>{t.name}</td>
            <td style={cellStyle}>{t.manager}</td>
            <td
              data-no-row-link
              style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}
            >
              <div style={{ display: "inline-flex", gap: 8 }}>
                <EditButton
                  path={`/tournament/${t.tournamentId}/teams/edit/${t._id}`}
                />
                <DeleteButton id={t._id} />
              </div>
            </td>
          </ClickableRow>
        ))}
      </tbody>
    </table>
  );
}

function AllGroups({
  groups,
  teamsByGroup,
  labels,
}: {
  groups: string[];
  teamsByGroup: Record<string, TeamWithGroup[]>;
  labels: { ungrouped?: string };
}) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {groups.map((g) => {
        const title = g === UNGROUPED ? labels.ungrouped ?? "Ungrouped" : g;
        const teams = teamsByGroup[g] || [];
        return (
          <section key={g}>
            <h4 style={{ margin: "8px 0", fontSize: 16, fontWeight: 700 }}>
              {title}
            </h4>
            <GroupTable name={title} teams={teams} />
          </section>
        );
      })}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "6px",
};
