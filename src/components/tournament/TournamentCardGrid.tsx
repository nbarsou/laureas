// components/tournaments/TournamentCardGrid.tsx
import TournamentCard, {
  Tournament,
} from "@/components/tournament/TournamentCard/Card";
import AddTournamentCard from "./TournamentCard/AddCard";

type GridProps = {
  tournaments: Tournament[];
  className?: string;
  hrefFor?: (t: Tournament) => string | undefined;
  metaFor?: (t: Tournament) => string | undefined;
  imageFor?: (t: Tournament) => string | undefined;
  emptyState?: React.ReactNode;
  addHref?: string;
  addLabel?: string;
  onAdd?: () => void;
};

export default function TournamentCardGrid({
  tournaments,
  className,
  hrefFor,
  metaFor,
  imageFor,
  emptyState,
  addHref,
  addLabel,
  onAdd,
}: GridProps) {
  if (!tournaments?.length) {
    return (
      <div className={className}>
        {emptyState ?? (
          <p className="text-sm text-zinc-500">No tournaments found.</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={["flex flex-wrap justify-start gap-4", className ?? ""].join(
        " "
      )}
    >
      {tournaments.map((t) => (
        <div key={t._id} className="shrink-0">
          <TournamentCard
            t={t}
            href={hrefFor?.(t)}
            meta={metaFor?.(t)}
            imageUrl={imageFor?.(t)}
          />
        </div>
      ))}

      <div className="shrink-0">
        {addHref ? (
          <AddTournamentCard href={addHref} label={addLabel} />
        ) : (
          <AddTournamentCard onClick={onAdd!} label={addLabel} />
        )}
      </div>
    </div>
  );
}
