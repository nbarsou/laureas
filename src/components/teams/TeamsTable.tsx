// components/TournamentsTable.tsx (SERVER)
import { listTeams, listTeamsWithGroupName } from "@/data/teams/service";
import { EditButton } from "@/components/common/EditButton";
import { DeleteButton } from "@/components/teams/DeleteTeamButton";
import ClickableRow from "@/components/common/ClickableRow";
import GroupedTeamsSwitcher from "@/components/teams/GroupedTeamSwitcher";
import React from "react";

type TeamWithGroup = {
  _id: string;
  tournamentId: string;
  groupId?: string;
  groupName?: string | null;
  name: string;
  manager: string;
};

export default async function TournamentsTable({ tid }: { tid: string }) {
  const teams = (await listTeams(tid)) as TeamWithGroup[];
  if (!teams?.length) return <p style={{ color: "#666" }}>No teams yet.</p>;

  const hasGroups = teams.some((t) => t.groupName?.trim().length);

  if (!hasGroups) return <FlatTeamsTable teams={teams} />;

  // Group + sort, keep "Ungrouped" last
  const UNGROUPED = "__UNGROUPED__";
  const buckets: Record<string, TeamWithGroup[]> = {};
  for (const t of teams) {
    const key = t.groupName?.trim() || UNGROUPED;
    (buckets[key] ||= []).push(t);
  }

  const groups = Object.keys(buckets)
    .filter((g) => g !== UNGROUPED)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  if (buckets[UNGROUPED]) groups.push(UNGROUPED);

  // Sort each group’s teams by name for consistent display
  for (const g of groups) {
    buckets[g].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }

  return (
    <GroupedTeamsSwitcher
      tournamentId={tid}
      groups={groups}
      teamsByGroup={buckets}
      labels={{ ungrouped: "Ungrouped" }}
    />
  );
}

/* --- legacy flat view (unchanged) --- */
function FlatTeamsTable({ teams }: { teams: TeamWithGroup[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Name", "Manager", "Group", ""].map((h) => (
            <th key={h} style={thStyle}>
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
            <td style={cellStyle}>{t.groupName ?? ""}</td>
            <td data-no-row-link style={actionCellStyle}>
              <div style={{ display: "inline-flex", gap: 8 }}>
                <EditButton
                  path={`/tournament/${t.tournamentId}/teams/edit/${t._id}`}
                />
                <DeleteButton id={t._id} tid={t.tournamentId} />
              </div>
            </td>
          </ClickableRow>
        ))}
      </tbody>
    </table>
  );
}

const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "6px",
  fontWeight: 600,
};
const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "6px",
};
const actionCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "right",
  whiteSpace: "nowrap",
};
