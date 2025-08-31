"use server";

import { RegisterSchema, RegisterInput } from "@/schemas";

export async function register(values: RegisterInput) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  return { sucess: "Email sent!" };
}
