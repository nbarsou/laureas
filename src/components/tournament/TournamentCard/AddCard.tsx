// components/tournament/AddTournamentCard.tsx
"use client";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import TournamentContainer from "@/components/tournament/TournamentCard/Container";

type Props =
  | { href: string; onClick?: undefined; label?: string; className?: string }
  | {
      href?: undefined;
      onClick: () => void;
      label?: string;
      className?: string;
    };

export default function AddTournamentCard(props: Props) {
  const label = props.label ?? "New tournament";

  return (
    <TournamentContainer
      className={[
        "group border-dashed transition",
        "hover:bg-gray-50 active:bg-gray-100", // darker shade hover/pressed
        props.className ?? "",
      ].join(" ")}
    >
      {/* Centered content (decorative only; link/button handles the click) */}
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-700 pointer-events-none">
        <div className="rounded-full border border-gray-200/70 bg-gray-50/60 p-4 ring-1 ring-gray-100/60 transition group-hover:bg-gray-100 group-active:bg-gray-200">
          <PlusIcon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="text-sm font-medium text-gray-800/90">{label}</div>
        <div className="text-xs text-gray-900/60">Create a tournament</div>
      </div>

      {/* Stretched interactive layer */}
      {"href" in props && props.href ? (
        <Link
          href={props.href}
          aria-label={label}
          className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60"
        />
      ) : (
        <button
          type="button"
          aria-label={label}
          onClick={props.onClick}
          className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60"
        />
      )}
    </TournamentContainer>
  );
}
