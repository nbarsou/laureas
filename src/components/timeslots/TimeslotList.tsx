// Server component: lists timeslots for a venue
import { fetchTimeslots } from "@/data/timeslots/service";
import type { Timeslot } from "@/data/timeslots/schema";

const DOW: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function groupByDay(slots: Timeslot[]) {
  return slots.reduce<Record<number, Timeslot[]>>((acc, s) => {
    (acc[s.day_of_week] ||= []).push(s);
    return acc;
  }, {});
}

function TimeRange({ start, end }: { start: string; end: string }) {
  return (
    <span>
      {start} – {end}
    </span>
  );
}

export async function TimeslotList({
  venueId,
  includeInactive = false,
}: {
  venueId: string;
  includeInactive?: boolean;
}) {
  const slots = await fetchTimeslots({ venueId, includeInactive });

  if (!slots.length) {
    return (
      <div className="rounded-md border p-4 text-sm text-neutral-600">
        No timeslots yet.
      </div>
    );
  }

  const byDay = groupByDay(slots);

  return (
    <section className="space-y-4">
      {Object.keys(DOW)
        .map(Number)
        .filter((dow) => byDay[dow]?.length)
        .map((dow) => (
          <div key={dow} className="rounded-md border">
            <div className="border-b px-3 py-2 text-sm font-semibold">
              {DOW[dow]}
            </div>
            <ul className="divide-y">
              {byDay[dow].map((s) => (
                <li
                  key={String(s._id)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${
                    s.is_active ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium">
                      <TimeRange start={s.start_time} end={s.end_time} />
                    </span>
                    {s.label && (
                      <span className="truncate text-neutral-600">
                        · {s.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {s.timezone || "America/Mexico_City"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.is_active
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                      }`}
                      title={s.is_active ? "Active" : "Inactive"}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
