import { AuthHeader } from "@/components/auth/header";
import { BackButton } from "@/components/auth/back-button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

// TOOD: Implement internationalization
export const ErrorCard = () => {
  return (
    <Card className="w-[400px] shawdow-md">
      <CardHeader>
        <AuthHeader label="Oops! Something went wrong!" />
      </CardHeader>
      <CardFooter>
        <BackButton label="Back to login" href="/auth/login" />
      </CardFooter>
    </Card>
  );
};
