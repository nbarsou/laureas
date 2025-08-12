"use client";

import { useRouter } from "next/navigation";

type Props = { path: string };

/* --- wire-frame button styling shared by both buttons --- */
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

/* ---------- Edit (client-side navigation) ---------- */
export function EditButton({ path }: Props) {
  const router = useRouter();
  return (
    <button style={btnBase} onClick={() => router.push(path)}>
      Edit
    </button>
  );
}
