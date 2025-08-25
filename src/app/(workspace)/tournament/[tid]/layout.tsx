import Header from "@/components/layout/Header";
import { SideNav } from "@/components/layout/SideNav";
import { getTournament } from "@/data/tournaments/service"; // your function

type Params = { tid: string };

export default async function TournamentLayout({
  params,
  children,
}: {
  params: Promise<Params>;
  children: React.ReactNode;
}) {
  // Optional: fetch once, stream below the fold with Suspense if heavy
  //const tournament = await fetchTournament(tid);
  const { tid } = await params;

  const tournament = await getTournament(tid);
  const name = tournament?.name ?? null;

  return (
    <>
    
      <div className="flex min-h-screen">
        {/* SIDE NAV */}
        <SideNav tid={tid} />

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header bar (name, status, quick actions) */}
          <header className="mb-4 flex items-center justify-between">
            {/* <h1 className="text-xl font-semibold">{tournament.name}</h1> */}
            <h1 className="text-xl font-semibold">TempTournament</h1>
            {/* quick-action buttons here */}
          </header>

          {children}
        </main>
      </div>
    </>
  );
}
