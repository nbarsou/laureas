// /tournament/page.tsx  (RSC)
import TournamentsTable from "@/components/tournament/TournamentTable";
import NewButton from "@/components/common/NewButton";

export default function TournamentsPage() {
  return (
    <section>
      <h1 className="text-xl font-bold">Tournaments</h1>
      <div className="flex items-center justify-between">
        <div />
        <NewButton href={`/tournament/new`}>New Tournament</NewButton>
      </div>
      <TournamentsTable />
    </section>
  );
}
