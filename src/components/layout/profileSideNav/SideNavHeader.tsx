"use client";
import { XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import { AvatarCircle } from "@/components/ui/AvatarCircle";

export default function SideNavHeader({
  handle,
  name,
  onClose,
  onBellClick,
}: {
  handle: string;
  name: string;
  onClose: () => void;
  onBellClick?: () => void;
}) {
  return (
    <div className="px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <AvatarCircle initial={(name || "?").trim().charAt(0)} size={40} />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{handle}</div>
          <div className="text-xs text-gray-500 truncate">{name}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded p-2 hover:bg-gray-100"
          onClick={onBellClick}
        ></button>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded p-2 hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
