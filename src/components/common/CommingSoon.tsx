// components/common/ComingSoon.tsx
"use client";

import { WrenchIcon } from "@heroicons/react/24/outline";

export default function ComingSoon() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white text-black">
      <div className="flex flex-col items-center space-y-4">
        <WrenchIcon className="h-16 w-16 text-black" />
        <h1 className="text-2xl font-bold tracking-wide">Coming Soon</h1>
        <p className="text-sm text-gray-500">
          This page is under construction.
        </p>
      </div>
    </div>
  );
}
