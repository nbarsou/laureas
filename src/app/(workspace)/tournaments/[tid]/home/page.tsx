import ComingSoon from "@/components/common/CommingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(context: {
  params: Promise<{ tid: string }>;
}) {
  const tid = (await context.params).tid;

  return (
    <main>
      <ComingSoon />
    </main>
  );
}
