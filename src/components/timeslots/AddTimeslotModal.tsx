// components/timeslots/AddTimeslotModal.tsx
"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { AddTimeslotForm } from "./AddTimeslotForm";

export function AddTimeslotModal({
  tid,
  venueId,
  defaultTimezone = "America/Mexico_City",
}: {
  tid: string;
  venueId: string;
  defaultTimezone?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
        onClick={() => setOpen(true)}
      >
        + Add timeslot
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a timeslot">
        <AddTimeslotForm
          tid={tid}
          venueId={venueId}
          defaultTimezone={defaultTimezone}
          inModal
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
