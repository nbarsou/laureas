"user client";

import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";

export const Social = ({
  label = "Sign in with Google",
}: {
  label: string;
}) => {
  return (
    <div className="flex items-center w-full gap-x-2">
      <Button size="lg" className="w-full" variant="outline" onClick={() => {}}>
        <FcGoogle className="h-5 w-5" />
        {label}
      </Button>
    </div>
  );
};
