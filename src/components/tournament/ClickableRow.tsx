// components/ClickableRow.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ClickableRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={(e) => {
        const el = e.target as HTMLElement;
        // Don’t navigate if a link/button (or anything marked) was clicked
        if (el.closest("a, button, [data-no-row-link]")) return;
        router.push(href);
      }}
      style={{ cursor: "pointer" }}
    >
      {children}
    </tr>
  );
}
