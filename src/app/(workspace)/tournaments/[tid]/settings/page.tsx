// app/tournaments/[id]/settings/page.tsx
import { getTournament } from "@/data/tournaments/actions";
import { TournamentSettingsForm } from "@/components/tournament/TournamentSettingsForm";
import { TournamentDangerZone } from "@/components/tournament/TournamentDangerZone";

export default async function SettingsPage({
  params,
}: {
  params: { tid: string };
}) {
  const t = await getTournament(params.tid);
  if (!t) {
    // handle 404
    throw new Error("Tournament not found");
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <TournamentSettingsForm tournament={t} />
      <TournamentDangerZone tournament={t} />
    </main>
  );
}
