import { CreateTournamentForm } from "@/components/tournament/CreateTournamentForm";
import { strict } from "assert";
import { Types } from "mongoose";

export default function NewTournamentPage() {
  return (
    <div className="p-6">
      <CreateTournamentForm
        ownerId={new Types.ObjectId("000000000000000000000000").toString()} // TODO: Replace with actual owner ID
      />
    </div>
  );
}
