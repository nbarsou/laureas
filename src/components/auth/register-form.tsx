"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/schemas";

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

import { register } from "@/data/register";

export const RegisterForm = () => {
  const t = useTranslations("Auth.login");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [sucess, setSuccess] = useState<string | undefined>("");

  // TODO: Add internationalization
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: RegisterInput) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.sucess);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      socialLabel="Sign in with Google"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter you name.."
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
              name="email"
              render={({ field }) => (
                <>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter an email..."
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter a password..."
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
          <FormSucess message={sucess} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Create account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
