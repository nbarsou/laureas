// components/tournament/NewTournamentForm.tsx
"use client";

import { createTeam} from "@/data/teams/service";
import { useActionState } from "react";

const initialState: State = { message: null, errors: {} };

export function NewTeamForm({ tid }: { tid: string }) {
  const [state, formAction] = useActionState(createTeam, initialState);

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

      {/* tournamentId (hidden) */}
      <input type="hidden" name="tournamentId" value={tid} />
      {state.errors?.tournamentId?.length ? (
        <p className={helpErr}>{state.errors.tournamentId.join(", ")}</p>
      ) : null}

      {/* name */}
      <div>
        <label htmlFor="name" className={labelBase}>
          Team name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Tigers FC"
          required
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

      {/* manager (email) */}
      <div>
        <label htmlFor="manager" className={labelBase}>
          Manager email
        </label>
        <input
          id="manager"
          name="manager"
          type="email"
          placeholder="manager@example.com"
          required
          aria-invalid={!!state.errors?.manager?.length}
          aria-describedby={
            state.errors?.manager?.length ? "manager-error" : undefined
          }
          className={inputBase}
        />
        {state.errors?.manager?.length ? (
          <p id="manager-error" className={helpErr}>
            {state.errors.manager.join(", ")}
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
