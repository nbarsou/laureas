import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string; teamId: string }>;
}) {
  const params = await props.params;
  const tournamentId = params.tid;
  const teamId = params.teamId;

  return (
    <main>
      <p>
        Team {teamId}, tournament {tournamentId}
      </p>
    </main>
  );
}
