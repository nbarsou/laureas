import MatchesByDayList from "@/components/matches/MatchesByDayList";
import ScheduleMenuBar from "@/components/scheduler/ScheduleMenuBar";
import { ScheduleIssuesStrip } from "@/components/scheduler/SchedulerIssues";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;

  const issues = [
    { id: "w1", severity: "warning" as const, message: "Only 1 court on Sat." },
    { id: "e1", severity: "error" as const, message: "Team A double-booked." },
  ];

  return (
    <main>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Matches</h1>
        <ScheduleIssuesStrip issues={issues} />
        <ScheduleMenuBar />
        <MatchesByDayList tournamentId={tid} />
      </div>
    </main>
  );
}
