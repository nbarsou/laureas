import ActionLinkButton from "@/components/common/ActionLinkButton";

type HeaderRowProps = {
  title: string;
  actionHref: string;
  actionLabel: string;
};

export default function HeaderRow({
  title,
  actionHref,
  actionLabel,
}: HeaderRowProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ActionLinkButton href={actionHref}>{actionLabel}</ActionLinkButton>
    </div>
  );
}
