import PlayerCard from "@/components/players/Player";

import React from "react";



export default async function Page(props: {
  params: Promise<{ tid: string; teamId: string; playerId: string }>;
}) {
  const params = await props.params;
  // const tid = params.tid;
  // const teamId = params.teamId;
  const playerId = params.playerId;
  return (
    <main>
      <PlayerCard id={playerId} />
    </main>
  );
}
