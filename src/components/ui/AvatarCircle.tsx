"use client";

export function AvatarCircle({
  initial,
  size = 40,
}: {
  initial: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium ring-1 ring-gray-300 select-none cursor-default"
      style={{ width: size, height: size }}
      aria-hidden="true"
      tabIndex={-1}
    >
      {initial.toUpperCase()}
    </div>
  );
}
