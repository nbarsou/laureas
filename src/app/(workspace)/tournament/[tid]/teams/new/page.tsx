import { NewTeamForm } from "@/components/teams/NewTeamForm";

export default async function NewTournamentPage(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;
  const tournamentId = params.tid;
  return (
    <div className="p-6">
      <NewTeamForm tid={tournamentId} />
    </div>
  );
}
