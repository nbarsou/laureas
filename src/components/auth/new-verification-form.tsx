"use client";

import { useSearchParams } from "next/navigation";
import CardWrapper from "@/components/auth/card-wrapper";
import { CircleLoader } from "react-spinners";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/data/verifications/actions";
import { FormError } from "../form-error";
import { FormSucess } from "../form-success";

export const NewVerifcationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (!token) {
      setError("Token missing!");
      return;
    }
    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token]);
  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <CircleLoader />}
        <FormSucess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
};
