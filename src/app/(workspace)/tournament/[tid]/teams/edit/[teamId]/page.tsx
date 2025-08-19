// app/tournament/[tid]/teams/edit/[teamId]

import { fetchTeamById } from "@/data/teams/service";
import { EditTeamForm } from "@/components/teams/EditTeamForm";

export type TeamDTO = {
  _id: string;
  tournamentId: string;
  name: string;
  manager: string;
};

export default async function Page(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;

  const { teamId } = params;

  const t = await fetchTeamById(teamId);
  if (!t) return <div className="mt-12 text-center">Team not found.</div>;

  const dto: TeamDTO = {
    _id: t._id.toString(),
    tournamentId: t.tournamentId.toString(),
    name: t.name,
    manager: t.manager,
  };

  return <EditTeamForm team={dto} />;
}
