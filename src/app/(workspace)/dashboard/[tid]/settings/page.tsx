import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const id = params.tid;

  return (
    <main>
      <p>Settings for tournament {params.tid} here</p>
    </main>
  );
}
