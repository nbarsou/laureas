import ComingSoon from "@/components/common/CommingSoon";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: {
  params: Promise<{ tid: string }>;
}) {
  const params = await props.params;
  const tid = params.tid;

  return (
    <main>
      <ComingSoon />
    </main>
  );
}
