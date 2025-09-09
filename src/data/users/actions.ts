"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { signIn } from "@/auth";

import {
  RegisterSchema,
  RegisterInput,
  LoginInput,
  makeLoginSchema,
  ResetSchema,
} from "@/schemas";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "./repo";
import {
  generatePasswordResetToken,
  generateVericationToken,
} from "@/lib/tokens";
import z from "zod";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";

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

    const verificationToken = await generateVericationToken(email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return { sucess: "Confirmation email sent!" };
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

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Invalid credentials!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVericationToken(existingUser.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email sent!" };
  }

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

export async function reset(values: z.infer<typeof ResetSchema>) {
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid email!" };

  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) return { error: "Email not found!" };

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent!" };
}
