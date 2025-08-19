// components/timeslots/AddTimeslotForm.tsx
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createTimeslot } from "@/data/timeslots/service";
import { useActionState, useRef } from "react";

type FieldErrors = Record<string, string[] | undefined>;
type ActionResult = { ok: boolean; message?: string; errors?: FieldErrors };

const initialState: ActionResult = { ok: false, errors: {} };

const days = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

function ErrorText({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{errors.join(", ")}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save timeslot"}
    </button>
  );
}

export function AddTimeslotForm({
  tid,
  venueId,
  defaultTimezone = "America/Mexico_City",
  inModal = false,
  onSuccess,
}: {
  tid: string;
  venueId: string;
  defaultTimezone?: string;
  /** set true when used inside a modal to prevent redirect */
  inModal?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState<ActionResult>(
    createTimeslot as any,
    initialState
  );

  React.useEffect(() => {
    if (state.ok) {
      // close modal + refresh parent data
      onSuccess?.();
      router.refresh();
      // optional: reset the form for the next use
      formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="grid max-w-md gap-4">
      <input type="hidden" name="tid" value={tid} />
      <input type="hidden" name="venue_id" value={venueId} />
      <input type="hidden" name="timezone" value={defaultTimezone} />
      {inModal && <input type="hidden" name="no_redirect" value="true" />}

      <div className="grid gap-1">
        <label htmlFor="day_of_week" className="text-sm font-medium">
          Day of week
        </label>
        <select
          id="day_of_week"
          name="day_of_week"
          className="rounded-md border px-2 py-1"
          defaultValue={1}
          required
        >
          {days.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <ErrorText errors={state?.errors?.["day_of_week"]} />
      </div>

      <div className="grid gap-1">
        <label htmlFor="start_time" className="text-sm font-medium">
          Start time (HH:mm)
        </label>
        <input
          id="start_time"
          name="start_time"
          type="time"
          className="rounded-md border px-2 py-1"
          step={60}
          required
        />
        <ErrorText errors={state?.errors?.["start_time"]} />
      </div>

      <div className="grid gap-1">
        <label htmlFor="end_time" className="text-sm font-medium">
          End time (HH:mm)
        </label>
        <input
          id="end_time"
          name="end_time"
          type="time"
          className="rounded-md border px-2 py-1"
          step={60}
          required
        />
        <ErrorText errors={state?.errors?.["end_time"]} />
      </div>

      <div className="grid gap-1">
        <label htmlFor="label" className="text-sm font-medium">
          Label (optional)
        </label>
        <input
          id="label"
          name="label"
          type="text"
          className="rounded-md border px-2 py-1"
          placeholder='e.g. "Prime Slot"'
          maxLength={80}
        />
        <ErrorText errors={state?.errors?.["label"]} />
      </div>

      <div className="inline-flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className="h-4 w-4"
          defaultChecked
          value="true"
        />
        <label htmlFor="is_active" className="text-sm">
          Active
        </label>
      </div>

      {state?.message && (
        <p
          className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
      {!inModal && (
        <p className="text-xs text-neutral-500">Timezone: {defaultTimezone}</p>
      )}
    </form>
  );
}
