// components/tournament/NewTournamentForm.tsx
"use client";

import { createTournament, type State } from "@/data/tournaments/service";
import { useActionState } from "react";

const initialState: State = { message: null, errors: {} };

export function NewTournamentForm() {
  const [state, formAction] = useActionState(createTournament, initialState);

  const inputBase =
    "w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black";
  const labelBase = "mb-1 block text-sm font-medium";
  const helpErr = "mt-1 text-sm text-red-600";

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 max-w-md space-y-6 rounded-md border border-black p-6"
    >
      <h1 className="text-2xl font-semibold">New Tournament</h1>

      {/* name */}
      <div>
        <label htmlFor="name" className={labelBase}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Summer Cup 2025"
          aria-invalid={!!state.errors?.name?.length}
          aria-describedby={
            state.errors?.name?.length ? "name-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.name?.length ? (
          <p id="name-error" className={helpErr}>
            {state.errors.name.join(", ")}
          </p>
        ) : null}
      </div>

      {/* start date */}
      <div>
        <label htmlFor="startDate" className={labelBase}>
          Start date
        </label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          aria-invalid={!!state.errors?.startDate?.length}
          aria-describedby={
            state.errors?.startDate?.length ? "startDate-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.startDate?.length ? (
          <p id="startDate-error" className={helpErr}>
            {state.errors.startDate.join(", ")}
          </p>
        ) : null}
      </div>

      {/* end date */}
      <div>
        <label htmlFor="endDate" className={labelBase}>
          End date
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          aria-invalid={!!state.errors?.endDate?.length}
          aria-describedby={
            state.errors?.endDate?.length ? "endDate-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.endDate?.length ? (
          <p id="endDate-error" className={helpErr}>
            {state.errors.endDate.join(", ")}
          </p>
        ) : null}
      </div>

      {/* form-level message */}
      {state.message && (
        <p className="text-center text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-black bg-transparent px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
      >
        Create
      </button>
    </form>
  );
}
