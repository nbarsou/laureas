"use client";

import { deleteVenue } from "@/data/venues/service";
import { TrashIcon } from "@heroicons/react/16/solid";

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  border: "1px solid #000",
  background: "transparent",
  cursor: "pointer",
  fontSize: "0.875rem",
  lineHeight: 1,
  boxSizing: "border-box",
  width: 96, // <- make them the same width
  height: 32, // <- and the same height
  marginLeft: 4,
};

export function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    await deleteVenue(id);
  };
  return (
    <form action={handleDelete} style={{ display: "inline" }}>
      <button type="submit" aria-label="Delete" style={btnBase}>
        <TrashIcon style={{ width: 16, height: 16 }} />
      </button>
    </form>
  );
}
