// app/account/page.tsx
import { redirect } from "next/navigation";

type Params = { tid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { tid } = await params;
  // server-side redirect – no component ever reaches the client
  redirect(`/tournaments/${tid}/home`);
}
