// app/(workspace)/tournament/page.tsx  (RSC)
import TitleRow from "@/components/layout/TitleRow";
import TournamentCardGrid from "@/components/tournament/TournamentCardGrid";
import { TournamentGridSkeleton } from "@/components/tournament/TournamentCard/Skeleton";
import { listTournaments } from "@/data/tournaments/actions";
import { Suspense } from "react";
import Header from "@/components/layout/header/Header";

async function TournamentsGridServer() {
  const tournaments = await listTournaments();
  return (
    <TournamentCardGrid
      tournaments={tournaments}
      hrefFor={(t) => `/tournaments/${t._id}`}
      addHref="/tournaments/new"
      addLabel="New Tournament"
    />
  );
}

export default function Page() {
  return (
    <section className="p-10">
      {/* Always visible */}
      <TitleRow
        title="Tournaments"
        actionHref={`/tournaments/new`}
        actionLabel={"New Tournament"}
      />

      <Suspense fallback={<TournamentGridSkeleton count={8} />}>
        <TournamentsGridServer />
      </Suspense>
    </section>
  );
}
