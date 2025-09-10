// An array of routes that are accesible to thhe public
// These routes do not require auth
// @type {string[]}
export const publicRoutes = ["/", "/auth/new-verification"];

// These routes will redirecct logged in users to /settings
export const authRoutes = ["/auth/login", "/auth/register", "/auth/error", "/auth/reset", "/auth/new-password"];

// The prefix for API authentications routes
// Routes that start with this prefix are used for API auth
export const apiAuthPrefix = "/api/auth";

// The defautl redirct parth after loggin in.
export const DEFAULT_LOGIN_REDIRECT = "/settings";
export const LOGIN = "/auth/login";
