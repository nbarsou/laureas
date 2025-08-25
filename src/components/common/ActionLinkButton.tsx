"use client";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

type ActionLinkButtonProps = {
  href: string;
  children: React.ReactNode;
};

export default function ActionLinkButton({
  href,
  children,
}: ActionLinkButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 
                 bg-white px-4 py-2 text-sm font-medium text-gray-800 
                 shadow-sm transition
                 hover:bg-gray-50 hover:border-gray-400
                 active:bg-gray-100 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-black"
    >
      <PlusIcon className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </Link>
  );
}
