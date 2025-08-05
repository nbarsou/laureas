// app/account/page.tsx
import { redirect } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const id = params.tid;
  // server-side redirect – no component ever reaches the client
  redirect(`/dashboard/${id}/home`);
}
