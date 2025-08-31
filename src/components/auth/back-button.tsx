"user client";

import { Link, type LinkProps } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

import type { UrlObject } from "url";

type BackButtonProps = {
  label: string;
  href: LinkProps["href"]; // typed by next-intl based on routing.pathnames
  locale?: LinkProps["locale"]; // optional: force a locale if you want
  prefetch?: LinkProps["prefetch"];
};

export const BackButton = ({
  label,
  href,
  locale,
  prefetch,
}: BackButtonProps) => {
  return (
    <Button variant="ghost" size="sm" className="w-full">
      <Link href={href} locale={locale} prefetch={prefetch}>
        {label}
      </Link>
    </Button>
  );
};
