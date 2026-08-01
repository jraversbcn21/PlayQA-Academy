import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { languages } from "@/lib/i18n/settings";
import { getCampusById } from "@/lib/constants/campuses";
import { getModuleById } from "@/lib/constants/curriculum";

/**
 * Public, unauthenticated routes only — auth-gated pages (dashboard,
 * leaderboard, badges, exams, settings) are excluded here the same way
 * they're excluded in robots.ts, since Google can't index past their
 * sign-in redirect. QA Fundamentals module and lesson routes (learn/qaf-*) are
 * public and included.
 */
const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/curriculum",
  "/glossary",
  "/privacy",
  "/terms",
  "/cookies",
  "/playground",
  "/playground/api",
  "/playground/bug-report",
  "/playground/cart",
  "/playground/catalog",
  "/playground/dynamic",
  "/playground/files",
  "/playground/frames",
  "/playground/istqb-coverage",
  "/playground/istqb-flashcards",
  "/playground/istqb-levels",
  "/playground/istqb-match",
  "/playground/istqb-quiz",
  "/playground/istqb-techniques",
  "/playground/istqb-truefalse",
  "/playground/login",
  "/playground/partitioning",
  "/playground/req-match",
  "/playground/setup",
  "/playground/signup",
  "/playground/table",
  "/playground/triage",
];

// Kept in sync manually with the campus ids in src/lib/constants/campuses.ts
// (qa-fundamentals/istqb/automation) rather than imported, so this file has
// no dependency on the data layer's shape.
const CAMPUS_ROUTES = ["/campus/qaFundamentals", "/campus/istqb", "/campus/automation"];

// QA Fundamentals is the one publicly-readable campus (growth roadmap
// Phase 2 — see PUBLIC_LEARN_PREFIX in src/middleware.ts). Derived from the
// campus/curriculum registries instead of hand-listed: 55 routes would
// drift, and CAMPUS_ROUTES' own comment already drifted at 3.
const QAF_LEARN_ROUTES = (getCampusById("qaFundamentals")?.moduleIds ?? []).flatMap(
  (moduleId) => {
    const mod = getModuleById(moduleId);
    if (!mod) return [];
    return [
      `/learn/${moduleId}`,
      ...mod.lessons.map((lesson) => `/learn/${moduleId}/${lesson.id}`),
    ];
  }
);

const ROUTES = [...STATIC_ROUTES, ...CAMPUS_ROUTES, ...QAF_LEARN_ROUTES];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((route) =>
    languages.map((lng) => ({
      url: `${SITE_URL}/${lng}${route}`,
      lastModified,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1.0 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          languages.map((altLng) => [altLng, `${SITE_URL}/${altLng}${route}`])
        ),
      },
    }))
  );
}
