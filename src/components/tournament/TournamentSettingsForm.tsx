// src/components/tournaments/TournamentSettingsForm.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/data/_helpers";
import type { TournamentOut } from "@/data/tournaments/dto";
import { updateTournamentAction } from "@/data/tournaments/actions";

import { TextField } from "@/components/ui/fields/TextField";
import { DateField } from "@/components/ui/fields/DateField";
import { SwitchField } from "@/components/ui/fields/SwitchField";

const initial: ActionResult = { ok: false, errors: {}, values: {} };

export function TournamentSettingsForm({
  tournament,
}: {
  tournament: TournamentOut;
}) {
  // bind to current tournament id
  const action = updateTournamentAction.bind(null, tournament._id);
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    initial
  );

  // sticky string helper → falls back to server value
  const v = (
    k: keyof ActionResult["values"] | keyof TournamentOut,
    fallback: string
  ) => (state.values?.[k as string] as string) ?? fallback;

  // ISO -> yyyy-mm-dd for native date input
  const dateOnly = (iso: string) => (iso ? iso.slice(0, 10) : "");

  // sticky boolean helper (state.values holds "true"/"false" strings)
  const boolFromState = (key: string, fallback: boolean) =>
    state.values?.[key] !== undefined
      ? state.values?.[key] === "true"
      : fallback;

  // controlled booleans (one source of truth)
  const [rr, setRr] = useState<boolean>(
    boolFromState("roundRobinDouble", tournament.roundRobinDouble)
  );
  const [sameDay, setSameDay] = useState<boolean>(
    boolFromState("allowSameDayPlay", tournament.allowSameDayPlay)
  );
  const [groups, setGroups] = useState<boolean>(
    boolFromState("groupsEnabled", tournament.groupsEnabled)
  );

  // re-sync toggles when server returns sticky values after a failed submit
  useEffect(() => {
    setRr(boolFromState("roundRobinDouble", tournament.roundRobinDouble));
    setSameDay(boolFromState("allowSameDayPlay", tournament.allowSameDayPlay));
    setGroups(boolFromState("groupsEnabled", tournament.groupsEnabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.values]);

  return (
    <form action={formAction} className="space-y-8">
      {/* General */}
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">General</h2>
          <p className="text-sm text-gray-600">
            Update the basic details of your tournament.
          </p>
        </header>

        <TextField
          name="name"
          label="Tournament name"
          placeholder="Enter tournament name"
          defaultValue={v("name", tournament.name)}
          error={state.errors?.name}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateField
            name="startDate"
            label="Start date"
            defaultValue={v("startDate", dateOnly(tournament.startDate))}
            error={state.errors?.startDate}
            required
          />
          <DateField
            name="endDate"
            label="End date"
            defaultValue={v("endDate", dateOnly(tournament.endDate))}
            error={state.errors?.endDate}
            required
          />
        </div>
      </section>

      {/* Options */}
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">Options</h2>
          <p className="text-sm text-gray-600">
            Match rules and groups configuration.
          </p>
        </header>

        <SwitchField
          name="roundRobinDouble"
          label="Double round-robin"
          description="Each team plays others twice."
          checked={rr}
          onChange={setRr}
          error={state.errors?.roundRobinDouble}
        />

        <SwitchField
          name="allowSameDayPlay"
          label="Allow same-day play"
          description="Teams can play more than one match per day."
          checked={sameDay}
          onChange={setSameDay}
          error={state.errors?.allowSameDayPlay}
        />

        <SwitchField
          name="groupsEnabled"
          label="Enable groups"
          description="Organize teams into groups."
          checked={groups}
          onChange={setGroups}
          error={state.errors?.groupsEnabled}
        />
      </section>

      {/* Form-level message */}
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex items-center gap-3">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
