import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

/**
 * Mirrors middleware.ts's gating: auth-gated routes are excluded, and the
 * one public exception — /learn/qaf-* (QA Fundamentals, growth roadmap
 * Phase 2) — is allowed via a more-specific Allow rule. Keep in sync with
 * PROTECTED_PATTERNS / PUBLIC_LEARN_PREFIX in src/middleware.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Allow beats the /learn/ disallow below for QA Fundamentals only:
        // Google resolves allow-vs-disallow by most-specific (longest) path,
        // and "/*/learn/qaf-" is longer than "/*/learn/". Mirrors the
        // PUBLIC_LEARN_PREFIX exception in src/middleware.ts — change both
        // together.
        allow: ["/", "/*/learn/qaf-"],
        disallow: [
          "/*/dashboard",
          "/*/learn/",
          "/*/leaderboard",
          "/*/badges",
          "/*/exams",
          "/*/settings",
          "/*/auth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
