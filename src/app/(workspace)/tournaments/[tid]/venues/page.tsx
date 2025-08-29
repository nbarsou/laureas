// import { notFound } from "next/navigation";
import NewButton from "@/components/common/NewButton";
import VenuesTable from "@/components/venues/VenuesTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;

  return (
    <main>
      <div className="flex items-center justify-between">
        <div />
        <NewButton href={`/tournament/${tid}/venues/new`}>Add Venue</NewButton>
      </div>
      <VenuesTable tid={tid} />
    </main>
  );
}
