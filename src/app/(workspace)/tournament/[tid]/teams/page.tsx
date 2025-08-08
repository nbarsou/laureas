import { Metadata } from "next";
import TeamsTable from "@/components/TeamsTable";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const id = params.tid;

  return (
    <main>
      <div className="flex justify-end">
        <Link
          href={`/dashboard/${id}/teams/new`}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <svg
            className="h-5 w-5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m6-6H6"
            />
          </svg>
          <span>New&nbsp;Team</span>
        </Link>
      </div>

      <TeamsTable query={""} currentPage={0} />
    </main>
  );
}
