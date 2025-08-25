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
      <section className="space-y-6 rounded-xl border border-gray-200 bg-white/50 p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Scheduler settings
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Configure how matches are generated and optionally use groups.
          </p>
        </div>

        {/* NEW: Groups settings */}
        {/** Keep a small bit of UI state so the mode select can be disabled when unchecked */}
        {/** (server still receives the posted values normally) */}
        {(() => {
          const [groupsEnabledUI, setGroupsEnabledUI] = React.useState<boolean>(
            v.settings?.groupsEnabled ?? false
          );
          return (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium">Groups</h3>
                <p className="text-xs text-gray-500">
                  Enable groups (pools) and choose how teams are assigned.
                </p>
              </div>
              <FormRow>
                <CheckboxField
                  label="Enable groups"
                  name="settings.groupsEnabled"
                  defaultChecked={v.settings?.groupsEnabled ?? false}
                  onChange={(e) =>
                    setGroupsEnabledUI(
                      (e as React.ChangeEvent<HTMLInputElement>).currentTarget
                        .checked
                    )
                  }
                  error={e["settings.groupsEnabled"]?.[0]}
                />
                <Field
                  as="select"
                  label="Groups mode"
                  name="settings.groupsMode"
                  defaultValue={v.settings?.groupsMode ?? "manual"}
                  disabled={!groupsEnabledUI}
                  error={e["settings.groupsMode"]?.[0]}
                >
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                </Field>
              </FormRow>
            </div>
          );
        })()}

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

        {!state.ok && state.message && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </section>

      <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50">
        Create
      </button>
    </form>
  );
}
