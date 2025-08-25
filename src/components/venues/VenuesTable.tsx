// components/venues/VenuesTable.tsx
import { fetchVenues, fetchVenuesByTournamentId } from "@/data/venues/service";
import { DeleteButton } from "@/components/venues/DeleteVenueButton";
import ClickableRow from "@/components/common/ClickableRow";
import { EditButton } from "@/components/common/EditButton";
import { logger } from "@/lib/logging";

type VenueRow = {
  _id: any;
  name: string;
  address: string;
  surface_type: "grass" | "turf" | "indoor" | "other";
};

export default async function VenuesTable({ tid }: { tid: string }) {
  const venues = (await fetchVenuesByTournamentId(tid)) as VenueRow[];
  logger.debug(`Fetched ${venues.length} venues for tournament ${tid}`);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Name", "Address", "Surface", ""].map((h) => (
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
        {venues?.map((v) => {
          const id = v._id?.toString?.() ?? String(v._id);
          return (
            <ClickableRow key={id} href={`/tournament/${tid}/venues/${id}`}>
              <td style={cellStyle}>{v.name}</td>
              <td style={cellStyle}>{v.address}</td>
              <td style={cellStyle}>{v.surface_type}</td>
              <td
                data-no-row-link
                style={{
                  ...cellStyle,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ display: "inline-flex", gap: 8 }}>
                  <EditButton path={`/tournament/${tid}/venues/edit/${id}`} />
                  <DeleteButton id={id} />
                </div>
              </td>
            </ClickableRow>
          );
        })}
      </tbody>
    </table>
  );
}

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "6px",
};
