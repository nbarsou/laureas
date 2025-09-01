// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";

import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;
