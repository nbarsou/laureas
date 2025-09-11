import { NewVerifcationForm } from "@/components/auth/new-verification-form";
import { Suspense } from "react";

const NewVerifcation = () => {
  return (
    <Suspense fallback={""}>
      <NewVerifcationForm />;
    </Suspense>
  );
};

export default NewVerifcation;
