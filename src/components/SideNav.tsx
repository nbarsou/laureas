// TODO: Permisions Later on
// import { useSession } from 'next-auth/react';
// ...
// const { data } = useSession();
// const roles = data?.user.memberships[tid] ?? [];
// const canSeeSettings = roles.includes('OWNER') || roles.includes('ADMIN');
// ...
// {canSeeSettings && <NavLink slug="settings" ... />}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const navItems = [
  { label: "Home", slug: "home", icon: HomeIcon },
  { label: "Teams", slug: "teams", icon: UsersIcon },
  { label: "Schedule", slug: "schedule", icon: CalendarIcon },
  { label: "Venues", slug: "venues", icon: MapPinIcon },
  { label: "Staff", slug: "staff", icon: ShieldCheckIcon },
  { label: "Settings", slug: "settings", icon: Cog6ToothIcon },
] as const;

export function SideNav({ tid }: { tid: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2 w-56 border-r">
      {navItems.map(({ label, slug, icon: Icon }) => {
        const href = `/tournament/${tid}/${slug}`;
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={slug}
            href={href}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
