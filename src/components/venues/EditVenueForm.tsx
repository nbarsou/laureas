// components/venues/EditVenueForm.tsx
"use client";

import { useActionState } from "react";
import { updateVenue, type ActionResult } from "@/data/venues/service";

export function EditVenueForm({
  venue,
}: {
  venue: {
    _id: string;
    tournamentId: string;
    name: string;
    address: string;
    surface_type: "grass" | "turf" | "indoor" | "other";
  };
}) {
  const initial: ActionResult = { ok: true };

  const action = (prev: ActionResult, formData: FormData) =>
    updateVenue(venue._id.toString(), prev, formData);

  const [result, formAction] = useActionState(action, initial);

  const errors = result.ok ? undefined : result.errors;

  return (
    <form action={formAction} className="...">
      <input type="hidden" name="tournamentId" value={venue.tournamentId} />

      {/* name */}
      <input
        name="name"
        defaultValue={venue.name}
        aria-invalid={!!errors?.name?.length}
      />
      {errors?.name?.length ? <p>{errors.name.join(", ")}</p> : null}

      {/* address */}
      <input
        name="address"
        defaultValue={venue.address}
        aria-invalid={!!errors?.address?.length}
      />
      {errors?.address?.length ? <p>{errors.address.join(", ")}</p> : null}

      {/* surface */}
      <select name="surface_type" defaultValue={venue.surface_type}>
        <option value="grass">Grass</option>
        <option value="turf">Turf</option>
        <option value="indoor">Indoor</option>
        <option value="other">Other</option>
      </select>
      {errors?.surface_type?.length ? (
        <p>{errors.surface_type.join(", ")}</p>
      ) : null}

      {!result.ok && result.message ? <p>{result.message}</p> : null}

      <button type="submit">Save changes</button>
    </form>
  );
}
