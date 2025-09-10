import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es"],

  // Used when no locale matches
  defaultLocale: "en",
  localePrefix: "as-needed",

  pathnames: {
    // If all locales use the same pathname, a single
    // external path can be used for all locales
    "/": "/",

    "/auth/login": "/auth/login",
    "/auth/register": "/auth/register",
    "/auth/error": "/auth/error",
    "/auth/new-verification": "/auth/new-verification",
    "/auth/reset": "/auth/reset",
    "/auth/new-password": "/auth/new-password",
    // "/blog": "/blog",

    // // If locales use different paths, you can
    // // specify the relevant external pathnames
    // "/services": {
    //   es: "/servicios",
    // },

    // // Encoding of non-ASCII characters is handled
    // // automatically where relevant
    // "/about": {
    //   es: "/über-uns",
    // },

    // // Dynamic params are supported via square brackets
    // "/news/[articleSlug]": {
    //   es: "/neuigkeiten/[articleSlug]",
    // },

    // // Static pathnames that overlap with dynamic segments
    // // will be prioritized over the dynamic segment
    // "/news/just-in": {
    //   es: "/neuigkeiten/aktuell",
    // },

    // // Also (optional) catch-all segments are supported
    // "/categories/[...slug]": {
    //   es: "/kategorien/[...slug]",
    // },
  },
});
