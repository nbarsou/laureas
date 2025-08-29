import { listPlayersByTeam } from "@/data/players/service";
// import { EditButton } from "@/components/common/EditButton";
import { DeleteButton } from "@/components/players/DeletePlayerButton";
import ClickableRow from "@/components/common/ClickableRow";
import { EditButton } from "../common/EditButton";

interface Props {
  tid: string;
  teamId: string;
}

export default async function PlayersTable({ tid, teamId }: Props) {
  const players = await listPlayersByTeam(teamId);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["First Name", "Last Name", " Number", ""].map((h) => (
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
        {players?.map((t: any) => (
          <ClickableRow
            key={t._id}
            href={`/tournament/${tid}/teams/${t.teamId.toString()}/player/${
              t._id
            }`}
          >
            <td style={cellStyle}>{t.firstName}</td>
            <td style={cellStyle}>{t.lastName}</td>
            <td style={cellStyle}>{t.number}</td>
            <td
              data-no-row-link
              style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}
            >
              <div style={{ display: "inline-flex", gap: 8 }}>
                <DeleteButton id={t._id.toString()} tid={tid} />
                <EditButton
                  path={`/tournament/${tid}/teams/${t.teamId.toString()}/player/edit/${t._id.toString()}`}
                />
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
