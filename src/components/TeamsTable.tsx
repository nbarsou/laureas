// app/ui/teams/TeamsTable.tsx
import Image from "next/image";
// import { fetchFilteredTeams } from "@/lib/actions/teams";
import { UpdateTeam, DeleteTeam } from "./TeamButtons";

type Props = {
  query: string;
  currentPage: number;
};

export default async function TeamsTable({ query, currentPage }: Props) {
  // const teams = await fetchFilteredTeams(query, currentPage);
  return <div></div>;
  // return (
  //   <div className="mt-6 flow-root">
  //     <div className="inline-block min-w-full align-middle">
  //       <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
  //         {/* ─────────────────────────── MOBILE STACK ─────────────────────────── */}
  //         <div className="md:hidden">
  //           {teams?.map((team) => (
  //             <div
  //               key={team._id.toString()}
  //               className="mb-2 w-full rounded-md bg-white p-4"
  //             >
  //               {/* header row */}
  //               <div className="flex items-center justify-between border-b pb-4">
  //                 <div className="flex items-center">
  //                   {/* fallback to a placeholder if logo_url is missing */}
  //                   <Image
  //                     src={"/avatar-placeholder.svg"}
  //                     className="mr-2 rounded-full"
  //                     width={28}
  //                     height={28}
  //                     alt={`${team.name} logo`}
  //                   />
  //                   <p className="font-medium">{team.name}</p>
  //                 </div>
  //               </div>

  //               {/* details row */}
  //               <div className="flex w-full items-start justify-between pt-4">
  //                 <div>
  //                   <p className="text-sm text-gray-500">
  //                     {team.managers.length
  //                       ? team.managers.join(", ")
  //                       : "No managers"}
  //                   </p>
  //                   <p className="mt-1 text-xs">
  //                     Created {team.createdAt.toString()}
  //                   </p>
  //                 </div>

  //                 <div className="flex shrink-0 justify-end gap-2">
  //                   <UpdateTeam id={String(team._id)} />
  //                   <DeleteTeam id={String(team._id)} />
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         {/* ─────────────────────────── DESKTOP TABLE ────────────────────────── */}
  //         <table className="hidden min-w-full text-gray-900 md:table">
  //           <thead className="rounded-lg text-left text-sm font-normal">
  //             <tr>
  //               <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
  //                 Team
  //               </th>
  //               <th scope="col" className="px-3 py-5 font-medium">
  //                 Managers
  //               </th>
  //               <th scope="col" className="px-3 py-5 font-medium">
  //                 Created
  //               </th>
  //               <th scope="col" className="relative py-3 pl-6 pr-3">
  //                 <span className="sr-only">Actions</span>
  //               </th>
  //             </tr>
  //           </thead>

  //           <tbody className="bg-white">
  //             {teams?.map((team) => (
  //               <tr
  //                 key={team._id.toString()}
  //                 className="border-b text-sm last-of-type:border-none
  //                            [&:first-child>td:first-child]:rounded-tl-lg
  //                            [&:first-child>td:last-child]:rounded-tr-lg
  //                            [&:last-child>td:first-child]:rounded-bl-lg
  //                            [&:last-child>td:last-child]:rounded-br-lg"
  //               >
  //                 {/* Team / logo */}
  //                 <td className="whitespace-nowrap py-3 pl-6 pr-3">
  //                   <div className="flex items-center gap-3">
  //                     <Image
  //                       src={"/avatar-placeholder.svg"}
  //                       className="rounded-full"
  //                       width={28}
  //                       height={28}
  //                       alt={`${team.name} logo`}
  //                     />
  //                     <span>{team.name}</span>
  //                   </div>
  //                 </td>

  //                 {/* Managers */}
  //                 <td className="whitespace-nowrap px-3 py-3">
  //                   {team.managers.length ? team.managers.join(", ") : "—"}
  //                 </td>

  //                 {/* Created date */}
  //                 <td className="whitespace-nowrap px-3 py-3">
  //                   {team.createdAt.toString()}
  //                 </td>

  //                 {/* Actions */}
  //                 <td className="whitespace-nowrap py-3 pl-6 pr-3">
  //                   <div className="flex justify-end gap-3">
  //                     <UpdateTeam id={team._id.toString()} />
  //                     <DeleteTeam id={team._id.toString()} />
  //                   </div>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   </div>
  // );
}
