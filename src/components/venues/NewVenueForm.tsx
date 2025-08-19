// components/venues/NewVenueForm.tsx
"use client";

import { useActionState } from "react";
import {
  createVenue,
  type ActionResult, // use ActionResult for state
} from "@/data/venues/service";

export function NewVenueForm({ tournamentId }: { tournamentId: string }) {
  const initialResult: ActionResult = { ok: true };
  const [result, formAction] = useActionState(createVenue, initialResult);

  const inputBase =
    "w-full border border-black bg-transparent px-3 py-2 rounded outline-none focus:ring-2 focus:ring-black";
  const labelBase = "mb-1 block text-sm font-medium";
  const helpErr = "mt-1 text-sm text-red-600";
  const btnBase =
    "w-full inline-flex items-center justify-center gap-2 rounded-md border border-black bg-transparent px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black";

  const fieldErrors = result.ok ? undefined : result.errors;

  return (
    <form
      action={formAction}
      className="mx-auto mt-12 max-w-md space-y-6 rounded-md border border-black p-6"
    >
      <h1 className="text-2xl font-semibold">New Venue</h1>

      {/* required by your schema */}
      <input type="hidden" name="tournamentId" value={tournamentId} />
      {fieldErrors?.tournamentId?.length ? (
        <p className={helpErr}>{fieldErrors.tournamentId.join(", ")}</p>
      ) : null}

      <div>
        <label htmlFor="name" className={labelBase}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Main Stadium"
          required
          aria-invalid={!!fieldErrors?.name?.length}
          aria-describedby={
            fieldErrors?.name?.length ? "name-error" : undefined
          }
          className={inputBase}
        />
        {fieldErrors?.name?.length ? (
          <p id="name-error" className={helpErr}>
            {fieldErrors.name.join(", ")}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="address" className={labelBase}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          placeholder="123 Field Rd., CDMX"
          required
          aria-invalid={!!fieldErrors?.address?.length}
          aria-describedby={
            fieldErrors?.address?.length ? "address-error" : undefined
          }
          className={inputBase}
        />
        {fieldErrors?.address?.length ? (
          <p id="address-error" className={helpErr}>
            {fieldErrors.address.join(", ")}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="surface_type" className={labelBase}>
          Surface
        </label>
        <select
          id="surface_type"
          name="surface_type"
          className={inputBase}
          defaultValue="other"
        >
          <option value="grass">Grass</option>
          <option value="turf">Turf</option>
          <option value="indoor">Indoor</option>
          <option value="other">Other</option>
        </select>
        {fieldErrors?.surface_type?.length ? (
          <p className={helpErr}>{fieldErrors.surface_type.join(", ")}</p>
        ) : null}
      </div>

      {!result.ok && result.message && (
        <p className="text-center text-sm text-red-600">{result.message}</p>
      )}

      <button type="submit" className={btnBase}>
        Create
      </button>
    </form>
  );
}
