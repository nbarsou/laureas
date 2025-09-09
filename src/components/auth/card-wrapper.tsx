"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { AuthHeader } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import { LinkProps } from "@/i18n/navigation";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  socialLabel?: string;
  backButtonLabel: string;
  backButtonHref: LinkProps["href"];
  showSocial?: boolean;
}

const CardWrapper = ({
  children,
  headerLabel,
  socialLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <AuthHeader label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && socialLabel && (
        <CardFooter>
          <Social label={socialLabel} />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
