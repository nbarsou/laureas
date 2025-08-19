// app/(dashboard)/teams/[teamId]/players/[playerId]/edit/page.tsx
import { notFound } from "next/navigation";
import { EditPlayerForm } from "@/components/players/EditPlayerForm";
import { fetchPlayerById } from "@/data/players/service";

type PlayerDTO = {
  _id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  number: number; // 1..99
};

export default async function Page(
  props: {
    params: Promise<{ teamId: string; playerId: string }>;
  }
) {
  const params = await props.params;
  const { playerId } = params;

  const player = await fetchPlayerById(playerId); // expect lean: Player | null
  if (!player) notFound();

  const dto: PlayerDTO = {
    _id: String(player._id),
    teamId: String(player.teamId),
    firstName: player.firstName,
    lastName: player.lastName,
    number: player.number,
  };

  return (
    <main className="p-6">
      <EditPlayerForm player={dto} />
    </main>
  );
}
