// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { routing } from "./i18n/routing";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
  LOGIN, // e.g. "/auth/login" or "/login"
} from "@/routes";
import { AccountStatus } from "@prisma/client";

// 1) next-intl
const intl = createMiddleware(routing);

// 2) next-auth v5
const { auth } = NextAuth(authConfig);

// Helper: does `path` equal `route` OR `/{locale}{route}` (with/without trailing slash)?
function stripTrailingSlash(s: string) {
  return s !== "/" && s.endsWith("/") ? s.slice(0, -1) : s;
}

function matchesRouteWithLocale(path: string, route: string) {
  const p = stripTrailingSlash(path);
  const r = stripTrailingSlash(route);

  // Exact (non-locale) match
  if (p === r) return true;

  for (const l of routing.locales) {
    // Root route: "/" should match "/en" and "/en/"
    if (r === "/") {
      if (p === `/${l}`) return true;
      // ("/en/" handled by strip + equality above)
    } else {
      // Locale-prefixed exact or nested
      if (p === `/${l}${r}`) return true;
      if (p.startsWith(`/${l}${r}/`)) return true;
    }
  }
  return false;
}

function includesAnyRoute(path: string, routes: readonly string[]) {
  return routes.some((r) => matchesRouteWithLocale(path, r));
}

// 3) Compose: i18n + auth gate in ONE wrapper
const composed = auth((req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  const status = req.auth?.user.status;

  const isApiAuthRoute = path.startsWith(apiAuthPrefix);
  const isPublicRoute = includesAnyRoute(path, publicRoutes);
  const isAuthRoute = includesAnyRoute(path, authRoutes);
  const isOnLogin = matchesRouteWithLocale(path, LOGIN);

  const isOnWaitlist = matchesRouteWithLocale(path, "/waitlist");
  const isProtectedRoute = !isPublicRoute && !isAuthRoute && !isApiAuthRoute;

  // Skip API auth paths (often excluded by matcher anyway)
  if (isApiAuthRoute) return NextResponse.next();

  // If already logged in and on an auth page → send to app
  if (isAuthRoute && isLoggedIn) {
    const dest =
      status !== AccountStatus.WAITLISTED
        ? DEFAULT_LOGIN_REDIRECT
        : "/waitlist";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  if (
    isLoggedIn &&
    (status === AccountStatus.WAITLISTED ||
      status === AccountStatus.SUSPENDED) &&
    isProtectedRoute &&
    !isOnWaitlist
  ) {
    return NextResponse.redirect(new URL("/waitlist", req.nextUrl));
  }

  // If NOT logged in and trying to access a non-public page → go to login
  // BUT do not redirect if we're already on the login (locale-prefixed or not)
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute && !isOnLogin) {
    return NextResponse.redirect(new URL(LOGIN, req.nextUrl));
  }

  // Otherwise: run next-intl (locale detection/rewrites)
  return intl(req);
});

// 4) Export single middleware entry; pass minimal ctx shape next-auth expects
export default function middleware(req: NextRequest) {
  return composed(req, { params: Promise.resolve({}) } as any);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
