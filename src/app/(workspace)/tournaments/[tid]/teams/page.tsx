import { Metadata } from "next";
import { TeamsTable } from "@/components/teams/TeamsTable";
import NewButton from "@/components/common/NewButton";
import { listTeams } from "@/data/teams/service";
import { getTournament } from "@/data/tournaments/actions";
import type { TeamOut } from "@/data/teams/dto";

export const metadata: Metadata = {
  title: "Teams",
};

const UNGROUPED = "__UNGROUPED__";

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const { tid } = await props.params;

  const [teams, tournament] = await Promise.all([
    listTeams(tid),
    getTournament(tid),
  ]);
  const hasGroups = Boolean(tournament?.groupsEnabled);

  // Early empty state
  if (!teams?.length) {
    return (
      <main>
        <h1 className="text-xl font-bold">Teams</h1>
        <div className="flex items-center justify-between">
          <div />
          <NewButton href={`/tournaments/${tid}/teams/new`}>
            New Teams
          </NewButton>
        </div>
        <p style={{ color: "#666", marginTop: 12 }}>No teams yet.</p>
      </main>
    );
  }

  // When groups are enabled, bucket by groupId and render one table per bucket.
  let content: React.ReactNode;

  if (!hasGroups) {
    // Single table, no header
    content = <TeamsTable tid={tid} teams={teams} />;
  } else {
    // Build buckets keyed by groupId (or UNGROUPED)
    const buckets: Record<string, TeamOut[]> = {};
    for (const t of teams) {
      const key = t.groupId?.trim() || UNGROUPED;
      (buckets[key] ||= []).push(t);
      console.log;
    }

    // Sort groups, keep UNGROUPED last
    const groups = Object.keys(buckets)
      .filter((g) => g !== UNGROUPED)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    if (buckets[UNGROUPED]) groups.push(UNGROUPED);

    // Sort teams within each bucket for stable display
    for (const g of groups) {
      buckets[g].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
    }

    content = (
      <div className="grid gap-6">
        {groups.map((g) => (
          <section
            key={g}
            className="grid gap-2 border border-neutral-300 rounded-md p-4"
          >
            <TeamsTable
              tid={tid}
              teams={buckets[g]}
              // groupName={g === UNGROUPED ? "Ungrouped" : g} TODO: Change back
              groupName="Test Groups"
            />
          </section>
        ))}
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-bold">Teams</h1>
      <div className="flex items-center justify-between">
        <div />
        <NewButton href={`/tournaments/${tid}/teams/new`}>New Teams</NewButton>
      </div>

      <div style={{ marginTop: 12 }}>{content}</div>
    </main>
  );
}
