import z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const ResetSchema = z.object({
  email: z.email(),
});

export function makeLoginSchema(t?: (key: string, values?: any) => string) {
  return z.object({
    email: z.email(
      t ? t("errors.email") : "Please enter a valid email address."
    ),
    password: z
      .string()
      .min(1, t ? t("errors.password") : "Password is requiered"),
  });
}
export type LoginInput = z.infer<ReturnType<typeof makeLoginSchema>>;

export const RegisterSchema = z.object({
  email: z.email("Email is required"),
  password: z
    .string()
    .min(6, "Minimun 6 characters required")
    .max(100, "Must be less than 100 characters"),
  name: z.string().min(1, "Name is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
