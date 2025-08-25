// components/layout/sidenav/SideNav.tsx
"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { NavButton } from "@/components/layout/sideNav/NavButton";

const navItems = [
  { label: "Home", slug: "home", Icon: HomeIcon },
  { label: "Teams", slug: "teams", Icon: UsersIcon },
  { label: "Schedule", slug: "schedule", Icon: CalendarIcon },
  { label: "Venues", slug: "venues", Icon: MapPinIcon },
  { label: "Settings", slug: "settings", Icon: Cog6ToothIcon },
] as const;

export function SideNav({ tid }: { tid: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 shrink-0 bg-neutral-100 border-r border-neutral-200"
      role="navigation"
      aria-label="Tournament navigation"
    >
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ label, slug, Icon }) => {
          const href = `/tournament/${tid}/${slug}`;
          const active = pathname?.startsWith(href) ?? false;
          return (
            <NavButton
              key={slug}
              href={href}
              label={label}
              Icon={Icon}
              active={active}
            />
          );
        })}
      </nav>
    </aside>
  );
}
