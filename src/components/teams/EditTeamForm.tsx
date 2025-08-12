// components/teams/EditTeamForm.tsx
"use client";

import { useActionState } from "react";
import { updateTeam, type State } from "@/data/teams/service";

export type TeamDTO = {
  _id: string;
  tournamentId: string;
  name: string;
  manager: string;
};

const initialState: State = { message: null, errors: {} };

export function EditTeamForm({ team }: { team: TeamDTO }) {
  const [state, formAction] = useActionState<State, FormData>(
    updateTeam,
    initialState
  );

  const fieldLabels: Record<string, string> = {
    id: "Team id",
    tournamentId: "Tournament",
    name: "Team name",
    manager: "Manager email",
  };

  const summaryItems = Object.entries(state.errors ?? {}).flatMap(
    ([key, msgs]) => (msgs ?? []).map((m) => `${fieldLabels[key] ?? key}: ${m}`)
  );

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 max-w-md space-y-6 rounded-md border border-black p-6"
    >
      <h1 className="text-2xl font-semibold">Edit Team</h1>

      {/* IDs (hidden) */}
      <input type="hidden" name="_id" value={team._id} />

      <input
        type="hidden"
        name="tournamentId"
        value={team.tournamentId}
        aria-invalid={!!state.errors?.tournamentId?.length}
        aria-describedby={
          state.errors?.tournamentId?.length ? "tournamentId-error" : undefined
        }
      />
      {state.errors?.tournamentId?.length ? (
        <p id="tournamentId-error" className="sr-only">
          {state.errors.tournamentId.join(", ")}
        </p>
      ) : null}

      {/* 🔎 Error summary for ALL fields (including hidden) */}
      {summaryItems.length > 0 && (
        <div
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          <ul className="list-disc pl-5">
            {summaryItems.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Team name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={team.name}
          aria-invalid={!!state.errors?.name?.length}
          aria-describedby={
            state.errors?.name?.length ? "name-error" : undefined
          }
          className="w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black"
        />
        {state.errors?.name?.length ? (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {state.errors.name.join(", ")}
          </p>
        ) : null}
      </div>

      {/* manager */}
      <div>
        <label htmlFor="manager" className="mb-1 block text-sm font-medium">
          Manager email
        </label>
        <input
          id="manager"
          name="manager"
          type="email"
          defaultValue={team.manager}
          aria-invalid={!!state.errors?.manager?.length}
          aria-describedby={
            state.errors?.manager?.length ? "manager-error" : undefined
          }
          className="w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black"
        />
        {state.errors?.manager?.length ? (
          <p id="manager-error" className="mt-1 text-sm text-red-600">
            {state.errors.manager.join(", ")}
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
        Save changes
      </button>
    </form>
  );
}
