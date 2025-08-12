import { Metadata } from "next";
import TeamsTable from "@/components/teams/TeamsTable";
import NewButton from "@/components/common/NewButton";

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
      <h1 className="text-xl font-bold">Teams</h1>
      <div className="flex items-center justify-between">
        <div />
        <NewButton href={`/tournament/${tid}/teams/new`}>New Teams</NewButton>
      </div>
      <TeamsTable />
    </main>
  );
}
