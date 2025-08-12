import { fetchAllTeams } from "@/data/teams/service";
import { EditButton } from "@/components/common/EditButton";
import { DeleteButton } from "@/components/teams/DeleteTeamButton";
import ClickableRow from "@/components/tournament/ClickableRow";

export default async function TournamentsTable() {
  const teams = await fetchAllTeams(); // lean objects

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
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {teams?.map((t: any) => (
          <ClickableRow
            key={t._id}
            href={`/tournament/${t.tournamentId.toString()}/teams/${t._id.toString()}`}
          >
            <td style={cellStyle}>{t.name}</td>
            <td style={cellStyle}>{t.manager}</td>
            <td
              data-no-row-link
              style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}
            >
              <div style={{ display: "inline-flex", gap: 8 }}>
                <EditButton
                  path={`/tournament/${t.tournamentId.toString()}/teams/edit/${t._id.toString()}`}
                />
                <DeleteButton id={t._id.toString()} />
              </div>
            </td>
          </ClickableRow>
        ))}
      </tbody>
    </table>
  );
}

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "6px",
};
