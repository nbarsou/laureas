// app/(workspace)/tournament/page.tsx  (RSC)
import TitleRow from "@/components/layout/TitleRow";
import TournamentCardGrid from "@/components/tournament/TournamentCardGrid";
import { TournamentGridSkeleton } from "@/components/tournament/TournamentCard/Skeleton";
import { listTournaments } from "@/data/tournaments/service";
import { Suspense } from "react";

async function TournamentsGridServer() {
  const tournaments = await listTournaments();
  return (
    <TournamentCardGrid
      tournaments={tournaments}
      hrefFor={(t) => `/tournament/${t._id}`}
      addHref="/tournament/new"
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
        actionHref={`/tournament/new`}
        actionLabel={"New Tournament"}
      />

      <Suspense fallback={<TournamentGridSkeleton count={8} />}>
        <TournamentsGridServer />
      </Suspense>
    </section>
  );
}
