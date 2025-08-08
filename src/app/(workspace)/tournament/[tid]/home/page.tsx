import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(context: {
  params: Promise<{ tid: string }>;
}) {
  const tid = (await context.params).tid;

  return (
    <main>
      <p>Home for {tid} tournament</p>
    </main>
  );
}
