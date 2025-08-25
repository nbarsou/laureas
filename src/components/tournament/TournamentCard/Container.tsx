// components/tournament/TournamentContainer.tsx
import React from "react";

export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 250;
export const HEADER_RATIO = 0.44;
export const HEADER_HEIGHT = Math.round(CARD_HEIGHT * HEADER_RATIO);

/** one grid to rule them all (left-packed, fixed card width, consistent gaps) */
export const GRID_GAP = "gap-x-3 gap-y-4";
export const TILES_CLASS = `grid justify-start ${GRID_GAP} [--card:${CARD_WIDTH}px] grid-cols-[repeat(auto-fill,minmax(var(--card),var(--card)))]`;

type Props = { children: React.ReactNode; className?: string };

export default function TournamentContainer({ children, className }: Props) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border bg-white shadow-sm flex flex-col ${
        className ?? ""
      }`}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {children}
    </div>
  );
}
