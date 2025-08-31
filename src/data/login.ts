"use server";

import { makeLoginSchema, LoginInput } from "@/schemas";

export async function login(values: LoginInput) {
  const validatedFields = makeLoginSchema().safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  return { sucess: "Email sent!" };
}
