// app/tournaments/edit/[id]/page.tsx
import { fetchTournamentById } from "@/data/tournaments/service";
import { EditTournamentForm } from "@/components/tournament/EditTournamentForm"; // <-- fix typo

type TournamentDTO = {
  _id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
};

export default async function Page({ params }: { params: { tid: string } }) {
  const t = await fetchTournamentById(params.tid);
  if (!t) {
    return <div className="mt-12 text-center">Tournament not found.</div>;
  }

  // 🔑 Make everything serializable
  const dto: TournamentDTO = {
    _id: t._id.toString(),
    name: t.name,
    startDate: new Date(t.startDate).toISOString(),
    endDate: new Date(t.endDate).toISOString(),
  };

  return <EditTournamentForm tournament={dto} />;
}
