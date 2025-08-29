"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import BrandLogo from "@/components/ui/BrandLogo";
import SideNav from "@/components/layout/profileSideNav/SideNav";
import SideNavHeader from "@/components/layout/profileSideNav/SideNavHeader";
import NavRow from "@/components/layout/profileSideNav/NavRow";
import {
  UserCircleIcon,
  EnvelopeIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { label: "Profile", slug: "profile", icon: UserCircleIcon },
  { label: "Messages", slug: "messages", icon: EnvelopeIcon },
  { label: "Billing", slug: "billing", icon: CreditCardIcon },
  { label: "Settings", slug: "settings", icon: Cog6ToothIcon },
] as const;

type HeaderProps = {
  tournamentName?: string | null;
};

import { useTournamentHeader } from "@/components/layout/header/TournamentHeaderContext";

export default function Header({ tournamentName }: HeaderProps) {

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = { handle: "nbarsou", name: "Nicolás Barrón" };

  const showBreadcrumb = Boolean(tournamentName);

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-neutral-100 backdrop-blur flex items-center justify-between">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-950"
        >
          <BrandLogo size={40} />
          <span>Laureas Sports</span>
        </Link>

        {showBreadcrumb && (
          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center text-sm text-gray-600"
          >
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/tournaments" className="hover:text-gray-900">
              Tournaments
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span
              className="font-medium text-gray-900 truncate max-w-[40vw]"
              title={tournamentName ?? ""}
            >
              {tournamentName}
            </span>
          </nav>
        )}

        <button
          type="button"
          aria-label="Open profile"
          onClick={() => setOpen(true)}
          className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-gray-300 bg-gray-200 text-sm font-medium"
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      </header>
      <div className="h-px w-full mx-auto bg-gray-300/60" />

      {/* Side nav */}
      <SideNav open={open} onClose={setOpen}>
        <SideNavHeader
          handle={user.handle}
          name={user.name}
          onClose={() => setOpen(false)}
        />

        <nav className="px-2 py-2">
          {navItems.map(({ label, slug, icon: Icon }) => (
            <NavRow
              key={slug}
              icon={Icon}
              // If you want client-side click that also closes:
              onClick={() => {
                setOpen(false);
                router.push(`/account/${slug}`);
              }}
              // Or render as a Link instead:
              // href={`/account/${slug}`}
            >
              {label}
            </NavRow>
          ))}
        </nav>
        <div className="mt-auto px-2 py-3">
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </SideNav>
    </>
  );
}
