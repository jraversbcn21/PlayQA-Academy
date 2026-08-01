/**
 * Locale + auth middleware.
 *
 * 1. Detects the user's locale from:
 *    a. The 'i18next' cookie (persisted choice)
 *    b. The Accept-Language header (negotiated via accept-language pkg)
 *    c. The default locale "es"
 * 2. Redirects requests without a locale prefix to /{locale}/path.
 * 3. Protects routes that require authentication (dashboard, learn/*,
 *    leaderboard, exams, settings) by checking the "auth_token" cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import {
  languages,
  fallbackLng,
  cookieName,
} from "@/lib/i18n/settings";

// Configure accept-language to only consider our supported set.
acceptLanguage.languages([...languages]);

const PROTECTED_PATTERNS = [
  /^\/[a-z]{2}\/dashboard/,
  /^\/[a-z]{2}\/learn\//,
  /^\/[a-z]{2}\/leaderboard/,
  /^\/[a-z]{2}\/badges/,
  /^\/[a-z]{2}\/exams/,
  /^\/[a-z]{2}\/settings/,
];

/**
 * Public exception to the /learn/ pattern above: the QA Fundamentals campus
 * is open to anonymous readers (growth roadmap Phase 2). The rule is
 * prefix-based and depends on a contract documented in
 * src/lib/constants/campuses.ts — only qaFundamentals module ids may ever
 * start with "qaf-". robots.ts mirrors this same exception; change both
 * together.
 */
const PUBLIC_LEARN_PREFIX = /^\/[a-z]{2}\/learn\/qaf-/;

function getLocale(
  request: NextRequest
): string {
  // 1. Cookie (user's explicit choice via language switcher)
  const cookieLocale = request.cookies.get(cookieName)?.value;
  if (cookieLocale && (languages as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Accept-Language header negotiation
  const headerLocale = acceptLanguage.get(
    request.headers.get("Accept-Language")
  );
  if (headerLocale && (languages as readonly string[]).includes(headerLocale)) {
    return headerLocale;
  }

  // 3. Fallback
  return fallbackLng;
}

function hasLocale(pathname: string): boolean {
  const segment = pathname.split("/")[1];
  return segment !== undefined && (languages as readonly string[]).includes(segment);
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(svg|png|jpe?g|gif|ico|woff2?|ttf|eot|css|js|map)$/.test(pathname)
  );
}

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname, search } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 1. No locale prefix → detect and redirect
  if (!hasLocale(pathname)) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}${search}`;
    return NextResponse.redirect(url);
  }

  // 2. Protected route check
  const isProtected =
    PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname)) &&
    !PUBLIC_LEARN_PREFIX.test(pathname);

  if (isProtected) {
    const authCookie = request.cookies.get("auth_token");
    if (!authCookie?.value) {
      const locale = pathname.split("/")[1] ?? fallbackLng;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/sign-in`;
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Set i18next cookie on every navigation so the language choice persists
  const locale = pathname.split("/")[1] ?? fallbackLng;
  const response = NextResponse.next();
  response.cookies.set(cookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
