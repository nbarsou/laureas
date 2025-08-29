"use client";

import * as React from "react";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

export type ScheduleIssue = {
  id: string;
  severity: "warning" | "error";
  message: string;
};

export default function ScheduleMenuBar({
  onCalculate,
  disabled,
  rightSlot,
}: {
  onCalculate?: () => void;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
      <div className="font-medium">Scheduler</div>

      <div className="ml-auto flex items-center gap-2">
        {rightSlot}

        <button
          type="button"
          onClick={onCalculate}
          disabled={disabled}
          className={[
            "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
            disabled
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-neutral-800",
          ].join(" ")}
        >
          Calculate schedule
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-sm hover:bg-neutral-50">
            More
            <svg
              aria-hidden
              className="ml-1 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.118l3.71-3.887a.75.75 0 111.08 1.04l-4.24 4.44a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md border border-neutral-200 bg-white p-1 shadow-lg focus:outline-none">
              <DropdownItem disabled label="Auto-place (soon)" />
              <DropdownItem disabled label="Balance courts (soon)" />
              <DropdownItem disabled label="Export (soon)" />
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

function DropdownItem({
  label,
  disabled,
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active, disabled }) => (
        <button
          type="button"
          disabled={disabled}
          className={[
            "w-full rounded-md px-3 py-2 text-left text-sm",
            active ? "bg-neutral-100" : "",
            disabled
              ? "text-neutral-400 cursor-not-allowed"
              : "text-neutral-800",
          ].join(" ")}
        >
          {label}
        </button>
      )}
    </Menu.Item>
  );
}
