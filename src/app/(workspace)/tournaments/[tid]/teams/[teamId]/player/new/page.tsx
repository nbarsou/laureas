import { NewPlayerForm } from "@/components/players/NewPlayerForm";

export default async function NewTournamentPage(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;
  // const tid = params.tid;
  const teamId = params.teamId;

  return (
    <div className="p-6">
      <NewPlayerForm teamId={teamId} />
    </div>
  );
}
