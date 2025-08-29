// app/(workspace)/tournaments/[tid]/layout.tsx
import type { ReactNode } from "react";
import { SideNav } from "@/components/layout/SideNav";
import { getTournament } from "@/data/tournaments/actions";

type Params = { tid: string };

export default async function TournamentDetailLayout({
  params,
  children,
}: {
  params: Params;
  children: ReactNode;
}) {
  const { tid } = params; // not a Promise
  const tournament = await getTournament(tid);
  const name = tournament?.name ?? "Tournament";

  return (
    <div className="min-h-screen flex">
      {/* Fixed side nav */}
      <SideNav tid={tid} />

      {/* Main area with its **own** padding */}
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {/* Local header (breadcrumb-aware Header if you want, or a simple h1) */}
        {/* <Header tournamentName={name} />  // If you want the same header here */}
        <header className="mb-4 flex items-center justify-between">
          {name}
          {/* quick actions */}
        </header>

        {children}
      </main>
    </div>
  );
}
