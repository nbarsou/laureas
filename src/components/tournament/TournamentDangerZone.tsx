// src/components/tournaments/TournamentDangerZone.tsx
"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/data/_helpers";
import type { TournamentOut } from "@/data/tournaments/dto";
import { softDeleteTournamentAction } from "@/data/tournaments/actions";
import clsx from "clsx";

const initial: ActionResult = { ok: false, errors: {}, values: {} };

export function TournamentDangerZone({
  tournament,
}: {
  tournament: TournamentOut;
}) {
  const [confirmText, setConfirmText] = React.useState("");
  const canDelete = confirmText === tournament.name;

  const action = softDeleteTournamentAction.bind(null, tournament._id);
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    initial
  );

  return (
    <section
      aria-labelledby="danger-zone-title"
      className={clsx("rounded-md border border-red-200")}
    >
      {/* header */}
      <div className="px-6 py-4">
        <h2
          id="danger-zone-title"
          className="text-base font-semibold text-red-600"
        >
          Danger Zone
        </h2>
      </div>

      {/* row */}
      <form
        action={formAction}
        className={clsx(
          "grid grid-cols-1 gap-6 px-6 py-6",
          "md:grid-cols-12 md:items-center", // centers button vertically on md+
          "border-t border-neutral-200"
        )}
      >
        {/* left column */}
        <div className="md:col-span-8 space-y-3">
          <div>
            <h3 className="text-sm font-medium">Delete this tournament</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Once you delete a tournament, there is no going back!
            </p>
          </div>
          {/* // TODO: Move this into modal that confirms deletion */}
          <div>
            <label
              htmlFor="confirm"
              className="block text-xs font-medium text-neutral-700"
            >
              Type <span className="font-semibold">{tournament.name}</span> to
              confirm
            </label>
            <input
              id="confirm"
              name="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={tournament.name}
              className={clsx(
                "mt-1 w-full md:w-2/3 rounded-md border px-3 py-2 outline-none",
                "border-neutral-300 bg-white/90",
                "focus:ring-2 focus:ring-red-500"
              )}
              aria-describedby="confirm-help"
            />
            <p id="confirm-help" className="mt-2 text-xs text-neutral-500">
              This affects all teams, matches, and public visibility for this
              tournament.
            </p>

            {state.message && (
              <p
                className="mt-2 text-sm text-red-600"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.message}
              </p>
            )}
          </div>
        </div>

        {/* right column (action) */}
        <div className="md:col-span-4 md:flex md:justify-end">
          <DeleteButton disabled={!canDelete} />
        </div>
      </form>
    </section>
  );
}

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={clsx(
        "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium",
        // GitHub-like danger outline
        "border-red-600 text-red-600",
        "hover:bg-red-50 dark:hover:bg-red-950/40",
        // disabled
        isDisabled && "opacity-60 pointer-events-none"
      )}
    >
      {pending ? "Deleting…" : "Delete this tournament"}
    </button>
  );
}
