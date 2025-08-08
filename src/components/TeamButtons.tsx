// app/ui/teams/buttons.tsx
"use client";
import { useRouter } from "next/navigation";
import { deleteTeam } from "@/data/teams/service";

export function UpdateTeam({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/dashboard/teams/${id}/edit`)}
      className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
    >
      Edit
    </button>
  );
}

export function DeleteTeam({ id }: { id: string }) {
  return (
    // <form action={() => deleteTeam(id)}>
    <form>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
