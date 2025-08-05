// components/Header.tsx
// TODO: fix depreceated things
"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CreditCardIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
// import { signOut } from "next-auth/react"; // TODO: hook up auth

/* ------------------------------------------------------------------ */
/* Dynamic dropdown items — reorder or extend here                     */
/* ------------------------------------------------------------------ */
const navItems = [
  { label: "Profile", slug: "profile", icon: UserCircleIcon },
  { label: "Messages", slug: "messages", icon: EnvelopeIcon },
  {
    label: "Billing",
    slug: "billing",
    icon: CreditCardIcon,
    // protected: true   // example flag for role-based filtering
  },
  { label: "Settings", slug: "settings", icon: Cog6ToothIcon },
] as const;

export function Header() {
  const router = useRouter();
  // Placeholder user until auth is wired
  const user = { name: "John Doe", email: "john@example.com", image: "" };

  return (
    <header className="h-14 px-6 border-b flex items-center justify-between bg-background/60 backdrop-blur">
      <div className="text-lg font-medium" id="page-title-slot" />

      <div className="flex items-center gap-4">
        {/* notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <BellIcon className="h-5 w-5" />
        </button>

        {/* avatar + dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-gray-300">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-medium bg-gray-200">
                {user.name?.charAt(0) ?? "?"}
              </span>
            )}
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
              {/* mini card */}
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>

              {/* dynamic links */}
              <div className="py-1">
                {navItems
                  /* .filter(i => !i.protected || canAccess) */ // when you add roles
                  .map(({ label, slug, icon: Icon }) => (
                    <Menu.Item key={slug}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => router.push(`/account/${slug}`)}
                          className={`${
                            active ? "bg-gray-100" : ""
                          } flex w-full items-center px-4 py-2 text-sm`}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
              </div>

              {/* logout */}
              <div className="py-1 border-t border-gray-100">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      /* onClick={() => signOut({ callbackUrl: "/login" })} */
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
