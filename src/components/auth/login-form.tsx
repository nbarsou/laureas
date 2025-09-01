"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeLoginSchema, type LoginInput } from "@/schemas";

import { useTranslations } from "next-intl";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import CardWrapper from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSucess } from "@/components/form-success";

import { login } from "@/data/users/actions";

export const LoginForm = () => {
  const t = useTranslations("Auth.login");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<LoginInput>({
    resolver: zodResolver(makeLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel={t("title")}
      backButtonLabel={t("noAccount")}
      socialLabel={t("social.continueWith", { provider: "Google" })}
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <>
                  <FormLabel>{t("email.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("email.ph")}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <>
                  <FormLabel>{t("password.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={t("password.ph")}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password?.message}
                  </FormMessage>
                </>
              )}
            />
          </div>
          {/* TODO: Internationalization */}
          <FormError message={error} />
          {/* TODO: Internationalization */}
          <FormSucess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {t("cta")}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
