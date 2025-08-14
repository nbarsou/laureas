// components/players/NewPlayerForm.tsx
"use client";

import { createPlayer, type State } from "@/data/players/service";
import { useActionState } from "react";

const initialState: State = { message: null, errors: {} };

export function NewPlayerForm({ teamId }: { teamId: string }) {
  const [state, formAction] = useActionState(createPlayer, initialState);

  const inputBase =
    "w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black";
  const labelBase = "mb-1 block text-sm font-medium";
  const helpErr = "mt-1 text-sm text-red-600";
  const btnBase =
    "w-full inline-flex items-center justify-center gap-2 rounded-md border border-black bg-transparent px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 max-w-md space-y-6 rounded-md border border-black p-6"
    >
      <h1 className="text-2xl font-semibold">New Team</h1>

      {/* teamId (hidden) */}
      <input type="hidden" name="teamId" value={teamId} />
      {state.errors?.teamId?.length ? (
        <p className={helpErr}>{state.errors.teamId.join(", ")}</p>
      ) : null}

      {/* firstName */}
      <div>
        <label htmlFor="firstName" className={labelBase}>
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="John"
          required
          aria-invalid={!!state.errors?.firstName?.length}
          aria-describedby={
            state.errors?.firstName?.length ? "firstName-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.firstName?.length ? (
          <p id="firstName-error" className={helpErr}>
            {state.errors.firstName.join(", ")}
          </p>
        ) : null}
      </div>

      {/* lastName */}
      <div>
        <label htmlFor="lastName" className={labelBase}>
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Doe"
          required
          aria-invalid={!!state.errors?.lastName?.length}
          aria-describedby={
            state.errors?.lastName?.length ? "lastName-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.lastName?.length ? (
          <p id="lastName-error" className={helpErr}>
            {state.errors.lastName.join(", ")}
          </p>
        ) : null}
      </div>

      {/* player number */}
      <div>
        <label htmlFor="number" className={labelBase}>
          Number
        </label>
        <input
          id="number"
          name="number"
          type="number"
          placeholder="11"
          required
          aria-invalid={!!state.errors?.number?.length}
          aria-describedby={
            state.errors?.number?.length ? "number-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.number?.length ? (
          <p id="number-error" className={helpErr}>
            {state.errors.number.join(", ")}
          </p>
        ) : null}
      </div>

      {/* form-level message */}
      {state.message && (
        <p className="text-center text-sm text-red-600">{state.message}</p>
      )}

      <button type="submit" className={btnBase}>
        Create
      </button>
    </form>
  );
}
