import NewButton from "@/components/common/NewButton";
import PlayersTable from "@/components/players/PlayersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;
  const teamId = params.teamId;

  return (
    <main>
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
