"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { signIn } from "@/auth";

import {
  RegisterSchema,
  RegisterInput,
  LoginInput,
  makeLoginSchema,
} from "@/schemas";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "./repo";

export async function register(values: RegisterInput) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { email, password, name } = validatedFields.data;

  const normalizedEmail = email?.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (normalizedEmail) {
      const existing = await getUserByEmail(normalizedEmail);
      if (existing) return { error: "Email already in use!" };
    }

    await prisma.user.create({
      data: {
        email: normalizedEmail ?? null,
        name: name?.trim() || null,
        password: hashedPassword,
      },
    });

    // TODO: Send veirification token email.
    return { sucess: "User created!" };
  } catch (error) {
    return { error: "Could not create user." };
  }
}

export async function login(values: LoginInput) {
  const validatedFields = makeLoginSchema().safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: "Sign in succesfull" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
}
