// components/AccountSideNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

/* ------------------------------------------------------------
 * TODO: Permissions (example)
 * ------------------------------------------------------------
 * // import { useSession } from "next-auth/react";
 * // const { data } = useSession();
 * // const roles = data?.user.roles ?? [];
 * // const canSeeBilling = roles.includes("PREMIUM");
 * ---------------------------------------------------------- */

const navItems = [
  { label: "Profile", slug: "profile", icon: UserCircleIcon },
  { label: "Messages", slug: "messages", icon: EnvelopeIcon },
  // Add/guard sections as your product grows ↓
  {
    label: "Billing",
    slug: "billing",
    icon: CreditCardIcon /* , protected: true */,
  },
  { label: "Settings", slug: "settings", icon: Cog6ToothIcon },
] as const;

export function AccountSideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 w-56 p-2 border-r">
      {navItems
        // Example: hide Billing if user lacks permission
        /* .filter((item) => (item.protected ? canSeeBilling : true)) */
        .map(({ label, slug, icon: Icon }) => {
          const href = `/account/${slug}`;
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
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      {/* spacer pushes back-button to bottom */}
      <div className="flex-1" />

      {/* back to dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" />
        Back to Dashboard
      </Link>
    </nav>
  );
}
