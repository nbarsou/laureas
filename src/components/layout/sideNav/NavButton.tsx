// components/layout/sidenav/NavButton.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export function NavButton({
  href,
  label,
  Icon,
  active = false,
}: {
  href: string;
  label: string;
  Icon: IconType;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
        "text-neutral-700 hover:text-neutral-900",
        // hover state
        "hover:bg-neutral-100",
        // focus
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
        // active (pressed/current page) state
        active &&
          "bg-neutral-100/80 text-neutral-900 ring-1 ring-neutral-200 shadow-inner"
      )}
    >
      <Icon
        className={clsx(
          "h-5 w-5",
          active
            ? "text-neutral-900"
            : "text-neutral-500 group-hover:text-neutral-700"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
