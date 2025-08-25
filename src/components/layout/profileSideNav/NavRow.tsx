"use client";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type BaseProps = { icon: IconType; children: string };
type ButtonProps = BaseProps & { onClick: () => void; href?: never };
type LinkProps = BaseProps & { href: string; onClick?: never };
type Props = ButtonProps | LinkProps;

export default function NavRow({ icon: Icon, children, ...rest }: Props) {
  const classes =
    "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50";
  const iconEl = <Icon className="h-5 w-5 text-gray-600" />;

  if ("href" in rest) {
    return (
      <Link href={rest.href as string} className={classes}>
        {iconEl}
        <span className="flex-1 text-left">{children}</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={rest.onClick} className={classes}>
      {iconEl}
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}
