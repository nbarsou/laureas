"use client";

import * as React from "react";

export type DayIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun … 6=Sat
export type HHMM = `${number}${number}:${number}${number}`;

export type AvailabilityOut = {
  day: DayIdx; // local day index
  start: HHMM | null; // null ⇒ open lower bound (“not before” absent)
  end: HHMM | null; // null ⇒ open upper bound (“not after” absent)
};

/* ------------ helpers ---------------- */

const DAYS: Record<DayIdx, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function describe(a: AvailabilityOut) {
  if (a.start && a.end) return `${DAYS[a.day]} ${a.start}–${a.end}`;
  if (a.start && !a.end) return `${DAYS[a.day]} ≥ ${a.start}`;
  if (!a.start && a.end) return `${DAYS[a.day]} ≤ ${a.end}`;
  return `${DAYS[a.day]} Any time`; // both null (rare, but safe)
}

/* tiny badge */
function Pill({ children }: React.PropsWithChildren) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f5f5f5",
        border: "1px solid #e5e5e5",
      }}
    >
      {children}
    </span>
  );
}

/* subtle card */
function Card({ children }: React.PropsWithChildren) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 12,
        background: "white",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}



/* ---------------- skeleton ---------------- */

export function AvailabilitySkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 140,
              height: 28,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.2s infinite",
            }}
          />
        ))}
      </div>
      {/* one-off keyframes injection */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </Card>
  );
}

/* ---------------- list (display) ---------------- */

export function AvailabilityList({
  items,
  onDelete,
}: {
  items: AvailabilityOut[];
  onDelete?: (idx: number) => void; // optional remove callback
}) {
  if (!items?.length) {
    return (
      <Card>
        <p style={{ color: "#666", margin: 0 }}>
          No time restrictions added yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((a, idx) => (
          <div
            key={idx}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Pill>{describe(a)}</Pill>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(idx)}
                aria-label="Remove restriction"
                style={{
                  border: "1px solid #e5e5e5",
                  background: "white",
                  borderRadius: 8,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- add form (placeholder) ---------------- */

export function AvailabilityAdd({
  onAdd,
  defaultDay = new Date().getDay() as DayIdx,
}: {
  onAdd?: (a: AvailabilityOut) => void;
  defaultDay?: DayIdx;
}) {
  const [day, setDay] = React.useState<DayIdx>(defaultDay);
  const [start, setStart] = React.useState<HHMM | "">("");
  const [end, setEnd] = React.useState<HHMM | "">("");

  const canSubmit = start !== "" || end !== "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!onAdd || !canSubmit) return;
    onAdd({
      day,
      start: start === "" ? null : (start as HHMM),
      end: end === "" ? null : (end as HHMM),
    });
    setStart("");
    setEnd("");
  }

  return (
    <Card>
      <form
        onSubmit={submit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <label style={fldLabel}>
          Day
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value) as DayIdx)}
            style={fldInput}
          >
            {Object.entries(DAYS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <label style={fldLabel}>
          Not before
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value as HHMM | "")}
            style={fldInput}
          />
        </label>

        <label style={fldLabel}>
          Not after
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value as HHMM | "")}
            style={fldInput}
          />
        </label>

        <div style={{ marginLeft: "auto" }} />

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #e5e5e5",
            background: canSubmit ? "black" : "#f5f5f5",
            color: canSubmit ? "white" : "#999",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          Add restriction
        </button>
      </form>

      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>
        Tip: leave one field empty to express an open bound (e.g. only “Not
        before 09:00”).
      </p>
    </Card>
  );
}

const fldLabel: React.CSSProperties = {
  display: "grid",
  gap: 4,
  fontSize: 12,
  color: "#444",
};

const fldInput: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #e5e5e5",
  minWidth: 140,
};

/* ---------------- one-stop wrapper ---------------- */

export default function AvailabilityPanel({
  loading,
  items,
  onAdd,
  onDelete,
}: {
  loading?: boolean;
  items?: AvailabilityOut[];
  onAdd?: (a: AvailabilityOut) => void;
  onDelete?: (idx: number) => void;
}) {
  if (loading) return <AvailabilitySkeleton rows={5} />;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AvailabilityAdd onAdd={onAdd} />
      <AvailabilityList items={items ?? []} onDelete={onDelete} />
    </div>
  );
}
