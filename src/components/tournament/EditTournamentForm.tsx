// components/tournament/EditTournamentForm.tsx
"use client";

import { useActionState } from "react";
import { updateTournament, type State } from "@/data/tournaments/service";

type TournamentDTO = {
  _id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
};

const initialState: State = { message: null, errors: {} };

function toDateInputValue(d: string | Date) {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
}

export function EditTournamentForm({
  tournament,
}: {
  tournament: TournamentDTO;
}) {
  const [state, formAction] = useActionState(updateTournament, initialState);

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 max-w-md space-y-6 rounded-md border border-black p-6"
    >
      <h1 className="text-2xl font-semibold">Edit Tournament</h1>

      <input type="hidden" name="_id" value={tournament._id} />

      {/* name */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={tournament.name}
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

      {/* start date */}
      <div>
        <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
          Start date
        </label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          defaultValue={toDateInputValue(tournament.startDate)}
          aria-invalid={!!state.errors?.startDate?.length}
          aria-describedby={
            state.errors?.startDate?.length ? "startDate-error" : undefined
          }
          className="w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black"
        />
        {state.errors?.startDate?.length ? (
          <p id="startDate-error" className="mt-1 text-sm text-red-600">
            {state.errors.startDate.join(", ")}
          </p>
        ) : null}
      </div>

      {/* end date */}
      <div>
        <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
          End date
        </label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={toDateInputValue(tournament.endDate)}
          aria-invalid={!!state.errors?.endDate?.length}
          aria-describedby={
            state.errors?.endDate?.length ? "endDate-error" : undefined
          }
          className="w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black"
        />
        {state.errors?.endDate?.length ? (
          <p id="endDate-error" className="mt-1 text-sm text-red-600">
            {state.errors.endDate.join(", ")}
          </p>
        ) : null}
      </div>

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
