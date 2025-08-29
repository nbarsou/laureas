// components/scheduler/ScheduleMenuBarSkeleton.tsx
"use client";
export default function ScheduleMenuBarSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
      <div className="ml-auto flex items-center gap-2">
        <div className="h-8 w-36 animate-pulse rounded bg-neutral-200" />
        <div className="h-8 w-20 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}

// components/scheduler/ScheduleIssuesSkeleton.tsx
("use client");
export function ScheduleIssuesSkeleton() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
      <div className="h-4 w-48 animate-pulse rounded bg-amber-200/60" />
      <div className="mt-2 space-y-2">
        <div className="h-7 w-full animate-pulse rounded bg-white" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-white" />
      </div>
    </div>
  );
}
