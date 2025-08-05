// src/components/Logo.tsx

import Image from "next/image"; // Optional but recommended with Next.js

interface LogoProps {
  width?: number;
  className?: string;
}

export default function Logo({ width = 128, className = "" }: LogoProps) {
  return (
    <div
      className={`flex items-center justify-center w-[${width}px] ${className}`}
    >
      <Image
        src="/logo.svg"
        alt="Laureas logo"
        width={width}
        height={width} // optional for square aspect ratio
        className="h-auto object-contain"
        priority
      />
    </div>
  );
}
