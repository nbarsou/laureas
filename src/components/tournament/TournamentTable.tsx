import { fetchAllTournaments } from "@/data/tournaments/service";
import { EditButton, DeleteButton } from "@/components/tournament/Buttons";
import ClickableRow from "@/components/tournament/ClickableRow";

export default async function TournamentsTable() {
  const tournaments = await fetchAllTournaments(); // lean objects

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Name", "Start Date", "End Date", ""].map((h) => (
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
        {tournaments?.map((t: any) => (
          <ClickableRow
            key={t._id}
            href={`/tournament/${t._id?.toString?.() ?? t._id}`}
          >
            <td style={cellStyle}>{t.name}</td>
            <td style={cellStyle}>
              {" "}
              {new Date(t.startDate).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </td>
            <td style={cellStyle}>
              {" "}
              {new Date(t.endDate).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </td>
            <td
              data-no-row-link
              style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}
            >
              <div style={{ display: "inline-flex", gap: 8 }}>
                <EditButton id={t._id.toString()} />
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
