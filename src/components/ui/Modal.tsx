// components/ui/Modal.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    open ? (
      <div
        className="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold">{title ?? "Modal"}</h2>
              <button
                className="rounded p-1 hover:bg-neutral-100"
                aria-label="Close"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    ) : null,
    document.body
  );
}
