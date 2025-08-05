// app/account/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  // server-side redirect – no component ever reaches the client
  redirect("/account/profile");
}
