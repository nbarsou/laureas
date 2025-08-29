// src/components/layout/TournamentHeaderContext.tsx
"use client";
import { createContext, useContext } from "react";

type Ctx = { tournamentName?: string | null };
const TournamentHeaderCtx = createContext<Ctx>({});

export function useTournamentHeader() {
  return useContext(TournamentHeaderCtx);
}

export function TournamentHeaderProvider({
  value,
  children,
}: {
  value: Ctx;
  children: React.ReactNode;
}) {
  return (
    <TournamentHeaderCtx.Provider value={value}>
      {children}
    </TournamentHeaderCtx.Provider>
  );
}
