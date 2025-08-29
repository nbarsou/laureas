import NewButton from "@/components/common/NewButton";
import PlayersTable from "@/components/players/PlayersTable";
import { Metadata } from "next";
import AvailabilityPanelClient from "@/components/availability/AvailabilityPanel";
import { getTeam } from "@/data/teams/service";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;
  const teamId = params.teamId;
  const team = await getTeam(teamId);
  if (!team) {
    throw new Error("Team not found");
  }
  return (
    <main>
      <h1 className="text-xl font-bold">{team.name}</h1>
      <AvailabilityPanelClient /* initialItems / initialLoading optional */ />
      <div className="flex items-center justify-between">
        <div />
        <NewButton href={`/tournament/${tid}/teams/${teamId}/player/new`}>
          New Player
        </NewButton>
      </div>

      <div>
        <PlayersTable teamId={teamId} tid={tid} />
      </div>
    </main>
  );
}
