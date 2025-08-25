import MatchesByDayList from "@/components/matches/MatchesByDayList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;

  return (
    <main>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Matches</h1>
        <MatchesByDayList tournamentId={tid} />
      </div>
    </main>
  );
}
