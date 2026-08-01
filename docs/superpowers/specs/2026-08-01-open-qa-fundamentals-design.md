# Open QA Fundamentals to the public — signed-out reader design

> **Status:** approved by Jorge, 2026-08-01.
> **Context:** Phase 2 of `docs/superpowers/plans/2026-07-20-adsense-monetization-roadmap.md`. Phases 0-1 are done (custom domain, SEO plumbing, Search Console verified 2026-08-01). This spec covers the design decisions for opening the QA Fundamentals campus to anonymous visitors; the SEO-mechanics tasks (robots, metadata, sitemap) are tracked alongside it and referenced where they interlock.
> **Decisions in this file were made by Jorge in the brainstorming session of 2026-08-01** (CTA at lesson end + free Next, no top banner, bookmark → sign-up).

## Goal

Let anonymous visitors — and Googlebot — read all QA Fundamentals content (10 modules, 45 lessons, ×2 locales ≈ 110 URLs), while ISTQB and Playwright Automation stay gated as the registration incentive. The funnel is: search → read free → register for the gated campuses and for progress/gamification.

## What opens

- **All 45 lesson pages** — `/{lng}/learn/qaf-*/{lessonId}`.
- **All 10 module pages** — `/{lng}/learn/qaf-mX`. Required, not optional: the module page is the index that links lessons together and the natural crawl path from `/campus/qaFundamentals`.
- **Nothing else.** `/learn/istqb-*` and `/learn/m1-*`..`/learn/m8-*` keep redirecting to sign-in exactly as today, as do dashboard/exams/badges/leaderboard/settings.

## Why a prefix rule is safe

The three campuses' module ids are disjoint by prefix (`src/lib/constants/campuses.ts:63-118`):

| Campus | Module id shape |
|---|---|
| qaFundamentals | `qaf-m1` … `qaf-m10` |
| istqb | `istqb-fundamentals`, `istqb-sdlc`, … |
| automation | `m1-typescript-foundations` … `m8-cicd-reporting` |

So "public iff the path segment after `/learn/` starts with `qaf-`" is exact today. It is enforced in **middleware** (`src/middleware.ts`, `PROTECTED_PATTERNS`): `/learn/` stays protected *except* the `qaf-` prefix. `robots.ts` mirrors the same rule (its header comment already declares it mirrors `PROTECTED_PATTERNS` — the two change together by design).

**Durable constraint this introduces:** any future campus whose module ids started with `qaf-` would be silently public. The prefix contract gets a comment at both the middleware rule and `campuses.ts`'s qaFundamentals `moduleIds`.

## Signed-out lesson experience

The lesson page already renders full content for a null `user` (every Firestore read/write in `useLesson`/`useProgress`/`useGamification`/`QuizSection`/`ExerciseSection` is behind a `!uid`/`if (user)` guard — audited 2026-08-01). The changes are to the interactive chrome:

1. **End of lesson.** The "Marcar como completada" button is replaced (signed-out only) by a **CTA card**: bilingual copy along the lines of *"¿Quieres guardar tu progreso y ganar puntos?" / "Want to save your progress and earn points?"* with a **"Crear cuenta gratis" / "Create free account"** button → `/auth/sign-up?callbackUrl=<current lesson URL>`. The `callbackUrl` system already exists end-to-end (Ranking login-loop fix, commits `90418d0`/`216e1f9`) — reuse it, don't rebuild it.
   - Copy must NOT claim the account is needed "to continue" — reading is free; the card sells progress/points/badges, the things an account actually adds. (Same honesty rule as the Playground `SignupBanner`, which deliberately doesn't claim progress-saving for exercises that save nothing.)
2. **Next button.** Signed-out, "Siguiente" becomes a real `<Link>` (crawlable `<a href>`), always enabled. Today it is `disabled={!lessonCompleted}` and `lessonCompleted` is `!!user && …` — an anonymous reader can never advance, which breaks both the funnel and crawling (Googlebot does not follow a disabled `<button>` with a `router.push` handler). Signed-in behaviour is unchanged: complete → Next unlocks.
3. **Bookmark button.** Stays visible signed-out; clicking redirects to `/auth/sign-up?callbackUrl=<current lesson URL>` instead of today's silent no-op (same bug class as the `de80171` mark-complete fix). Signed-in behaviour unchanged.
4. **No top banner.** The end-of-lesson CTA is the only conversion element on lesson pages, and none is added to module pages either. The roadmap's open question about reusing `SignupBanner` on public lessons is answered: **no**.
5. **Quizzes/exercises inside lessons** keep working signed-out (client-side); they simply record no points. No changes.
6. **Module page** (`/learn/qaf-mX`) needs no UX changes: signed-out it already renders with 0% progress, all lessons "available" (`ENFORCE_MODULE_LOCKING = false`), and its CTA reads "start". Only gating/metadata change.

## SEO mechanics (tracked as their own tasks, summarized for coherence)

- **robots.ts** (task F2.2): allow `/*/learn/qaf-`, keep the rest of `/learn/` disallowed. Without this the whole phase indexes nothing.
- **Per-page metadata** (task F2.3): both `/learn/` routes are Client Components with no `generateMetadata` — they'd publish ~110 URLs sharing the layout's default title. Split into server `page.tsx` + `XxxClient.tsx` (the Phase 1 pattern), with title/description sourced from the curriculum/lesson registry so copy can't drift, and canonical/hreflang via `buildAlternates`. Applies to the two `learn/` routes generally, but only `qaf-` URLs will be crawlable.
- **Sitemap** (task F2.5): add the 10 module + 45 lesson routes ×2 locales, derived from `CAMPUSES`/`CURRICULUM` — not hand-listed.

## Error handling

- Non-existent module/lesson under `/learn/qaf-…` renders the existing "not found" states — unchanged.
- A signed-out visitor hitting a gated `/learn/` URL keeps today's redirect (sign-in with `callbackUrl`).
- No new Firestore surface: anonymous readers must trigger **zero** Firestore calls (already true by audit; verified at runtime in F2.6).

## Testing / verification (task F2.6)

Against a production build, via Playwright + served-HTML checks (not screenshots):

1. Served HTML of a `qaf-` lesson contains the real lesson text, its own `<title>` and canonical — before hydration.
2. `/learn/istqb-*` and `/learn/m1-*` still redirect signed-out.
3. robots.txt allows `qaf-`, still disallows the rest; sitemap serves the new URLs and they all return 200.
4. Zero Firestore requests from an anonymous session (network-level assert).
5. Signed-in regression pass: complete a lesson → points, Next unlock, progress all unchanged.
6. The CTA card and bookmark redirect land on sign-up with a working `callbackUrl` round-trip.
