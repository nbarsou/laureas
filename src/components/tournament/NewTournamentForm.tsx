"use client";
import { useActionState } from "react";
import type { ActionResult } from "@/data/_helpers";
import { createTournamentAction } from "@/data/tournaments/actions";
import { TextField } from "@/components/ui/fields/TextField";
import { DateField } from "@/components/ui/fields/DateField";
import { SwitchField } from "@/components/ui/fields/SwitchField";

const initial: ActionResult = { ok: false, errors: {}, values: {} };

export function NewTournamentForm({ ownerId }: { ownerId: string }) {
  const action = createTournamentAction.bind(null, ownerId);
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    initial
  );

  // helper: get sticky value
  const v = (k: string) => (state.values?.[k] as string) ?? "";
  
  return (
    <form action={formAction} className="space-y-4">
      <TextField
        name="name"
        label="Tournament name"
        defaultValue={v("name")}
        placeholder="Enter tournament name"
        error={state.errors?.name}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateField
          name="startDate"
          label="Start date"
          defaultValue={v("startDate")?.slice(0, 10)}
          error={state.errors?.startDate}
          required
        />
        <DateField
          name="endDate"
          label="End date"
          defaultValue={v("endDate")?.slice(0, 10)}
          error={state.errors?.endDate}
          required
        />
      </div>

      <SwitchField
        name="roundRobinDouble"
        label="Double round-robin"
        description="Each team plays others twice."
        defaultChecked={v("roundRobinDouble") === "true"}
        error={state.errors?.roundRobinDouble}
      />

      <SwitchField
        name="allowSameDayPlay"
        label="Allow same-day play"
        description="Teams can play more than one match per day"
        defaultChecked={
          v("allowSameDayPlay") ? v("allowSameDayPlay") === "true" : true
        }
        error={state.errors?.allowSameDayPlay}
      />

      <SwitchField
        name="groupsEnabled"
        label="Enable groups"
        defaultChecked={v("groupsEnabled") === "true"}
        error={state.errors?.groupsEnabled}
      />

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-sm hover:bg-gray-50"
      >
        Create tournament
      </button>
    </form>
  );
}
