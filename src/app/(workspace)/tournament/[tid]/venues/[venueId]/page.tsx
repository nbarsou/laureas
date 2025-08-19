// app/tournament/[tid]/venues/[venueId]/page.tsx
import { notFound } from "next/navigation";
import { fetchVenueById } from "@/data/venues/service";
import { logger } from "@/lib/logging";
import { TimeslotList } from "@/components/timeslots/TimeslotList";
import { AddTimeslotModal } from "@/components/timeslots/AddTimeslotModal";

type Params = { venueId: string; tid: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>; // <-- promise now
}) {
  const { venueId, tid } = await params;

  try {
    const venue = await fetchVenueById(venueId);
    if (!venue) {
      logger.error("Venue not found");
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <main className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Timeslots</h1>
        <AddTimeslotModal venueId={venueId} tid={tid} />
      </div>

      <TimeslotList venueId={venueId} includeInactive />
    </main>
  );
}
