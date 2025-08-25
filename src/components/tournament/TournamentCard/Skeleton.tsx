// components/tournament/TournamentCardSkeleton.tsx
import TournamentContainer, {
  HEADER_HEIGHT,
} from "@/components/tournament/TournamentCard/Container";

export function TournamentCardSkeleton({ className }: { className?: string }) {
  return (
    <TournamentContainer
      className={["animate-pulse", className ?? ""].join(" ")}
    >
      {/* Header placeholder */}
      <div className="w-full bg-zinc-200" style={{ height: HEADER_HEIGHT }} />

      {/* Body placeholder */}
      <div className="flex-1 space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
          <div className="h-3 w-40 rounded bg-zinc-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-zinc-200" />
          <div className="h-3 w-48 rounded bg-zinc-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-zinc-200" />
          <div className="h-3 w-56 rounded bg-zinc-200" />
        </div>
      </div>
    </TournamentContainer>
  );
}

export function TournamentGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={["flex flex-wrap gap-5", className ?? ""].join(" ")}
    >
      <span className="sr-only">Loading tournaments…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0">
          <TournamentCardSkeleton />
        </div>
      ))}
    </div>
  );
}
