// app/dashboard/venues/edit/[venueId]/page.tsx
import { notFound } from "next/navigation";
import { EditVenueForm } from "@/components/venues/EditVenueForm";
import { fetchVenueById } from "@/data/venues/service";
import { logger } from "@/lib/logging";

type Params = { venueId: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>; // <-- promise now
}) {
  const { venueId } = await params; // <-- await before using

  const venue = await fetchVenueById(venueId);
  if (!venue) {
    logger.error("Venue not found");
    notFound();
  }

  // Ensure serializable strings for ids (ObjectId -> string)
  const dto = {
    _id: (venue as any)._id?.toString?.() ?? String((venue as any)._id),
    tournamentId:
      (venue as any).tournamentId?.toString?.() ??
      String((venue as any).tournamentId),
    name: venue.name,
    address: venue.address,
    surface_type: venue.surface_type as "grass" | "turf" | "indoor" | "other",
  };

  return (
    <main>
      <EditVenueForm venue={dto} />
    </main>
  );
}
