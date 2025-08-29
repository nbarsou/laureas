import { NewTournamentForm } from "@/components/tournament/NewTournamentForm";
import { Types } from "mongoose";

export default function NewTournamentPage() {
  return (
    <div className="p-6">
      <NewTournamentForm
        ownerId={new Types.ObjectId("000000000000000000000000").toString()}
      />
    </div>
  );
}
