"use client";
import Image from "next/image";

export default function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.svg"
        alt="Laureas"
        width={size}
        height={size}
        priority
      />
    </span>
  );
}
