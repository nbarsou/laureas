// src/components/tournaments/CreateTournamentForm.tsx
"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  createTournament,
  type ActionResult,
} from "@/data/tournaments/service";
import { Field } from "@/components/common/form/Field";
import { CheckboxField } from "@/components/common/form/Checkbox";
import { FormRow } from "@/components/common/form/Row";

const INITIAL: ActionResult = { ok: true, errors: {} };

export function CreateTournamentForm({ ownerId }: { ownerId: string }) {
  const action = createTournament.bind(null, ownerId);
  const [state, formAction] = useActionState(action, INITIAL);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic info */}
      <section className="space-y-6">
        <FormRow>
          <Field
            label="Name"
            name="name"
            placeholder="Summer League 2025"
            defaultValue={v.name ?? ""}
            required
            error={e["name"]?.[0]}
          />
          <div />
        </FormRow>

        <FormRow>
          <Field
            label="Start date"
            name="startDate"
            type="date"
            defaultValue={v.startDate ?? ""}
            required
            error={e["startDate"]?.[0]}
          />
          <Field
            label="End date"
            name="endDate"
            type="date"
            defaultValue={v.endDate ?? ""}
            required
            error={e["endDate"]?.[0]}
          />
        </FormRow>
      </section>

      {/* Settings (from the get-go) */}
      <section className="space-y-6 rounded-lg border border-dashed border-gray-300 p-4">
        <h2 className="text-sm font-semibold">Scheduler settings</h2>

        <FormRow>
          <Field
            as="select"
            label="Scheduler mode"
            name="settings.schedulerMode"
            defaultValue={v.settings?.schedulerMode ?? "compressed"}
            error={e["settings.schedulerMode"]?.[0]}
          >
            <option value="compressed">Compressed</option>
            <option value="spread">Spread</option>
          </Field>

          <CheckboxField
            label="Double round robin"
            name="settings.doubleRoundRobin"
            defaultChecked={!!v.settings?.doubleRoundRobin}
            error={e["settings.doubleRoundRobin"]?.[0]}
          />
        </FormRow>

        <FormRow>
          <Field
            label="Min gap (minutes) same day"
            name="settings.minGapMinutesSameDay"
            type="number"
            defaultValue={v.settings?.minGapMinutesSameDay ?? 60}
            error={e["settings.minGapMinutesSameDay"]?.[0]}
          />
          <Field
            label="Max backtracks"
            name="settings.maxBacktracks"
            type="number"
            defaultValue={v.settings?.maxBacktracks ?? 400}
            error={e["settings.maxBacktracks"]?.[0]}
          />
        </FormRow>

        <FormRow>
          <CheckboxField
            label="Balance preferred starts"
            name="settings.balancePreferredStarts"
            defaultChecked={v.settings?.balancePreferredStarts ?? true}
            error={e["settings.balancePreferredStarts"]?.[0]}
          />
          <CheckboxField
            label="Allow same-day double header"
            name="settings.allowSameDayDoubleHeader"
            defaultChecked={v.settings?.allowSameDayDoubleHeader ?? true}
            error={e["settings.allowSameDayDoubleHeader"]?.[0]}
          />
        </FormRow>
      </section>

      {!state.ok && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
        Create
      </button>
    </form>
  );
}
