import TeamRow, { TeamOut } from "./teamrow/TeamRow";
import TeamRowSkeleton from "./teamrow/TeamRowSkeleton";
import AvailabilityPanelClient from "@/components/availability/AvailabilityPanel";

export function TeamsTable({
  tid,
  teams,
  loading,
  groupName,
}: {
  tid: string;
  teams?: TeamOut[];
  loading?: boolean;
  groupName?: string;
}) {
  const showHeader = !!groupName;

  return (
    <section style={{ display: "grid", gap: 8 }}>
      {showHeader && (
        <>
          <h2 className="text-lg font-semibold">{groupName}</h2>
          <AvailabilityPanelClient /* initialItems / initialLoading optional */
          />
        </>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {showHeader && (
          <thead>
            <tr>
              {["Team", "Group", ""].map((h) => (
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
        )}

        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <TeamRowSkeleton key={i} />
              ))
            : teams?.map((t) => <TeamRow key={t._id} team={t} tid={tid} />)}
        </tbody>
      </table>
    </section>
  );
}
