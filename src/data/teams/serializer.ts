import { TeamOut } from "./dto";

export function toTeamOut(row: any) {
  const doc = row;
  const dto = {
    _id: String(doc._id),
    tournamentId: String(doc.tournamentId),
    name: doc.name,
    schemaVersion: doc.schemaVersion,
    custom:
      doc.custom instanceof Map
        ? Object.fromEntries(doc.custom)
        : doc.custom ?? {},
    customMissing: doc.customMissing ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  return TeamOut.parse(dto);
}
