// components/tournament/TournamentCard.tsx
"use client";

import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { CalendarDaysIcon, TrophyIcon } from "@heroicons/react/24/outline";
import TournamentContainer, {
  HEADER_HEIGHT,
} from "@/components/tournament/TournamentCard/Container";

export type Tournament = {
  _id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
};

type Props = {
  t: Tournament;
  href?: string; // when provided, whole card is clickable
  meta?: string;
  imageUrl?: string; // placeholder used if omitted
  className?: string;
};

export default function TournamentCard({
  t,
  href,
  meta,
  imageUrl,
  className,
}: Props) {
  const start = new Date(t.startDate);
  const end = new Date(t.endDate);
  const now = new Date();

  let statusText = "";
  let dotClass = "bg-zinc-400";
  if (now < start) {
    const d = differenceInCalendarDays(start, now);
    statusText = `Upcoming (${
      d === 0 ? "today" : `in ${d} day${d === 1 ? "" : "s"}`
    })`;
    dotClass = "bg-emerald-500";
  } else if (now <= end) {
    const left = differenceInCalendarDays(end, now) + 1;
    statusText = `Ongoing (${left} day${left === 1 ? "" : "s"} left)`;
    dotClass = "bg-amber-500";
  } else {
    const ago = differenceInCalendarDays(now, end);
    statusText = `Finished (${ago} day${ago === 1 ? "" : "s"} ago)`;
    dotClass = "bg-zinc-400";
  }

  const dateRange = formatRange(start, end);
  const bannerSrc = imageUrl ?? placeholderDataUrl(t.name || "Tournament");

  return (
    <TournamentContainer className={className}>
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ height: HEADER_HEIGHT }}
      >
        <img
          src={bannerSrc}
          alt=""
          className="h-full w-full object-cover pointer-events-none"
          aria-hidden="true"
        />
        {/* Decorative overlay should not capture clicks */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        <h3 className="absolute bottom-3 left-4 pr-4 text-xl font-semibold text-white drop-shadow-sm line-clamp-1 pointer-events-none">
          {t.name}
        </h3>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 space-y-3 p-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-700">
          <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
          <span className="font-medium truncate">{statusText}</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-600">
          <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{dateRange}</span>
        </div>

        {meta && (
          <div className="flex items-center gap-2 text-zinc-600">
            <TrophyIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{meta}</span>
          </div>
        )}
      </div>

      {/* Stretched link overlay — guarantees the whole card is clickable, and only within bounds */}
      {href && (
        <Link
          href={href}
          aria-label={`Open ${t.name}`}
          className="absolute inset-0 z-10"
        />
      )}
    </TournamentContainer>
  );
}

/* Helpers */
function formatRange(start: Date, end: Date) {
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
    }
    return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

/** Placeholder SVG (square) */
function placeholderDataUrl(text: string) {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#d1d5db'/>
        <stop offset='100%' stop-color='#374151'/>
      </linearGradient>
    </defs>
    <rect width='800' height='800' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica, Arial'
          font-size='36' fill='white' opacity='0.9'>${escapeXml(text)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function escapeXml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
}
