"use client";

import * as React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import type { ScheduleIssue } from "./ScheduleMenuBar";

export function ScheduleIssuesStrip({
  issues,
  defaultOpen = true,
  onClear,
}: {
  issues: ScheduleIssue[];
  defaultOpen?: boolean;
  onClear?: () => void;
}) {
  if (!issues?.length) return null;

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const hasError = errors > 0;

  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div
          className={[
            "rounded-md border p-2",
            hasError
              ? "border-red-300 bg-red-50"
              : "border-amber-300 bg-amber-50",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <SeverityDot kind={hasError ? "error" : "warning"} />
            <div className="text-sm font-medium text-neutral-800">
              {hasError ? `${errors} error(s)` : `${warnings} warning(s)`}{" "}
              detected
            </div>

            <div className="ml-auto flex items-center gap-2">
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-white/60"
                >
                  Clear
                </button>
              )}

              <Disclosure.Button className="rounded-md px-2 py-1 text-xs text-neutral-700 hover:bg-white/60">
                {open ? "Hide details" : "Show details"}
              </Disclosure.Button>
            </div>
          </div>

          <Transition
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Disclosure.Panel>
              <ul className="mt-2 space-y-1">
                {issues.map((i) => (
                  <li
                    key={i.id}
                    className={[
                      "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                      i.severity === "error"
                        ? "border-red-200 bg-white"
                        : "border-amber-200 bg-white",
                    ].join(" ")}
                  >
                    <SeverityDot kind={i.severity} />
                    <span className="text-neutral-800">{i.message}</span>
                  </li>
                ))}
              </ul>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}

function SeverityDot({ kind }: { kind: "warning" | "error" }) {
  const cls =
    kind === "error"
      ? "bg-red-500 border-red-600"
      : "bg-amber-400 border-amber-500";
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 rounded-full border ${cls}`}
    />
  );
}
