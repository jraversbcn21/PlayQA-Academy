# Open QA Fundamentals Publicly — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anonymous visitors (and Googlebot) can read all QA Fundamentals modules and lessons; ISTQB and Automation stay gated; each opened page carries its own metadata and appears in robots/sitemap.

**Architecture:** Prefix-based gating (`qaf-` module ids are disjoint from `istqb-`/`m1-`..`m8-`) applied in middleware and mirrored in robots.ts. The two `/learn/` Client Components get the Phase-1 server/client split so they can export `generateMetadata` sourced from `CURRICULUM`. Signed-out lesson chrome: end-of-lesson sign-up CTA card, always-enabled crawlable Next `<Link>`, bookmark click → sign-up. Spec: `docs/superpowers/specs/2026-08-01-open-qa-fundamentals-design.md`.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind, i18next (`{es,en}` everywhere), Firebase (untouched — anon readers must trigger zero Firestore calls).

## Global Constraints

- Every user-facing string is bilingual `{ es, en }` — no empty `"en": ""`.
- Quality gate before every commit: `npm run typecheck`, `npm run lint` (0 errors/warnings), `npm run build`. Never run build while a dev server is up (Windows `.next` contention).
- Direct-to-`main` workflow; feature commits followed by an AGENTS.md `docs:` commit.
- **No unit-test runner exists in this repo.** The established verification pattern is: quality gate + curl/Playwright checks against a running server. Each task's "verify" steps follow that pattern instead of TDD.
- Signed-in behaviour must not change anywhere. Anonymous readers must trigger **zero** Firestore requests.
- Canonical host is `https://www.playqacademy.com` (`SITE_URL`); all metadata via `buildAlternates`.

---

### Task 1: Middleware — open `/learn/qaf-*`, keep the rest gated

**Files:**
- Modify: `src/middleware.ts:24-31` (PROTECTED_PATTERNS block) and `:86-88` (the check)
- Modify: `src/lib/constants/campuses.ts:63` (comment on the qaFundamentals `moduleIds`)

**Interfaces:**
- Produces: signed-out `GET /{lng}/learn/qaf-*` → 200; signed-out `GET /{lng}/learn/<anything else>` → 307 to sign-in with `callbackUrl`. Tasks 2-8 rely on exactly this behaviour.

- [ ] **Step 1: Add the public-prefix exemption in `src/middleware.ts`**

Replace lines 24-31 with:

```ts
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
```

- [ ] **Step 2: Apply the exemption in the protected-route check**

Replace the `isProtected` computation (lines 86-88) with:

```ts
  const isProtected =
    PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname)) &&
    !PUBLIC_LEARN_PREFIX.test(pathname);
```

- [ ] **Step 3: Document the prefix contract at the data end**

In `src/lib/constants/campuses.ts`, immediately above the qaFundamentals `moduleIds: [` line (~:63), add:

```ts
    // CONTRACT: these ids all start with "qaf-", and only this campus's ids
    // may ever use that prefix. middleware.ts and robots.ts expose
    // /learn/qaf-* publicly based on it — a future campus whose module ids
    // began with "qaf-" would silently become public.
```

- [ ] **Step 4: Verify with curl against a dev server (no auth cookie)**

Run `npm run dev`, then in another shell:

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/es/learn/qaf-m1
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/es/learn/qaf-m1/qaf-m1-l1
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/es/learn/istqb-fundamentals
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/es/learn/m1-typescript-foundations/m1-l1
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/en/learn/qaf-m10
```

Expected: the three `qaf-` URLs return `200 `; the istqb and automation URLs return `307 http://localhost:3000/es/auth/sign-in?callbackUrl=...`. **Kill the dev server afterwards** (build comes later).

- [ ] **Step 5: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/middleware.ts src/lib/constants/campuses.ts
git commit -m "feat(middleware): open /learn/qaf-* to anonymous readers"
```

---

### Task 2: robots.ts — allow `qaf-`, keep the rest disallowed

**Files:**
- Modify: `src/app/robots.ts`

**Interfaces:**
- Consumes: the Task 1 gating rule (this file mirrors it).
- Produces: `/robots.txt` with an `Allow: /*/learn/qaf-` overriding the broader `Disallow: /*/learn/`.

- [ ] **Step 1: Add the allow rule**

Replace the `rules` array in `src/app/robots.ts` with:

```ts
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
```

Also update the file's header comment (lines 4-8) to:

```ts
/**
 * Mirrors middleware.ts's gating: auth-gated routes are excluded, and the
 * one public exception — /learn/qaf-* (QA Fundamentals, growth roadmap
 * Phase 2) — is allowed via a more-specific Allow rule. Keep in sync with
 * PROTECTED_PATTERNS / PUBLIC_LEARN_PREFIX in src/middleware.ts.
 */
```

- [ ] **Step 2: Verify the served file**

`npm run dev`, then:

```bash
curl -s http://localhost:3000/robots.txt
```

Expected output contains both `Allow: /*/learn/qaf-` and `Disallow: /*/learn/`. Kill the dev server.

- [ ] **Step 3: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/app/robots.ts
git commit -m "feat(seo): allow /learn/qaf-* in robots.txt"
```

---

### Task 3: i18n — CTA copy for the signed-out lesson footer

**Files:**
- Modify: `public/locales/es/common.json` (inside `lesson.player`, after `"completeToContinue"`)
- Modify: `public/locales/en/common.json` (same position)

**Interfaces:**
- Produces: keys `lesson.player.signupCtaTitle`, `lesson.player.signupCtaBody`, `lesson.player.signupCtaButton` consumed by Task 5.

- [ ] **Step 1: Add the Spanish keys**

In `public/locales/es/common.json`, `lesson` → `player`, after the `"completeToContinue"` line add:

```json
      "signupCtaTitle": "¿Quieres guardar tu progreso?",
      "signupCtaBody": "Crea una cuenta gratis para guardar tu avance, ganar puntos e insignias y desbloquear los campus de ISTQB y Automatización.",
      "signupCtaButton": "Crear cuenta gratis",
```

- [ ] **Step 2: Add the English keys**

Same position in `public/locales/en/common.json`:

```json
      "signupCtaTitle": "Want to save your progress?",
      "signupCtaBody": "Create a free account to save your progress, earn points and badges, and unlock the ISTQB and Automation campuses.",
      "signupCtaButton": "Create free account",
```

Copy rule (from the spec): the CTA must NOT claim an account is needed *to continue* — reading is free; it sells progress/points/badges/gated campuses.

- [ ] **Step 3: Quality gate + commit** (JSON syntax errors surface in build)

```bash
npm run typecheck && npm run lint && npm run build
git add public/locales/es/common.json public/locales/en/common.json
git commit -m "feat(i18n): signed-out lesson sign-up CTA copy"
```

---

### Task 4: Server/client split + `generateMetadata` for both `/learn/` routes

**Files:**
- Create: `src/app/[lng]/learn/[moduleId]/[lessonId]/LessonPlayerClient.tsx` (the current page file, renamed + trivially adapted)
- Modify: `src/app/[lng]/learn/[moduleId]/[lessonId]/page.tsx` (becomes a small server file)
- Create: `src/app/[lng]/learn/[moduleId]/ModulePageClient.tsx` (same treatment)
- Modify: `src/app/[lng]/learn/[moduleId]/page.tsx`

**Interfaces:**
- Consumes: `getModuleById(id)` / `getLessonById(moduleId, lessonId)` from `@/lib/constants/curriculum` (return `CurriculumModule | undefined` / `CurriculumLesson | undefined`, both with bilingual `title`/`description`), `buildAlternates(lng, path)` from `@/lib/seo`.
- Produces: `LessonPlayerClient` — default export, props `{ lng: string; moduleId: string; lessonId: string }` (plain strings, NOT a params Promise). `ModulePageClient` — default export, same minus `lessonId`. Task 5 edits `LessonPlayerClient.tsx`.

This is the exact Phase-1 pattern (`GlossaryClient`, `CampusPageClient`): the server `page.tsx` owns `generateMetadata` and renders the client component as a passthrough.

- [ ] **Step 1: Create `LessonPlayerClient.tsx`**

`git mv` the current lesson `page.tsx` to `LessonPlayerClient.tsx`. Then change ONLY its props plumbing — replace the `interface LessonPageProps`, the component signature, and the `use(props.params)` unwrap (current lines 89-100) with:

```tsx
interface LessonPlayerClientProps {
  lng: string;
  moduleId: string;
  lessonId: string;
}

export default function LessonPlayerClient({
  lng,
  moduleId,
  lessonId,
}: LessonPlayerClientProps) {
```

and delete the now-unused `use` import from the react import line (keep `useState`, `useCallback`, `ReactNode`). Everything else stays byte-identical.

- [ ] **Step 2: Write the new server `page.tsx` for lessons**

```tsx
import type { Metadata } from "next";
import { getModuleById, getLessonById } from "@/lib/constants/curriculum";
import { buildAlternates } from "@/lib/seo";
import LessonPlayerClient from "./LessonPlayerClient";

interface PageParams {
  params: Promise<{ lng: string; moduleId: string; lessonId: string }>;
}

/**
 * Titles/descriptions come from CURRICULUM — the same source that renders
 * the lesson header — so metadata can never drift from the content
 * (the buildExerciseMetadata/PLAYGROUND_EXERCISES pattern from Phase 1).
 */
export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const { lng, moduleId, lessonId } = await props.params;
  const mod = getModuleById(moduleId);
  const lesson = getLessonById(moduleId, lessonId);
  if (!mod || !lesson) return {};

  const lang = lng === "es" ? "es" : "en";
  const title = lesson.title[lang];
  const description = lesson.description[lang];
  const alternates = buildAlternates(lng, `/learn/${moduleId}/${lessonId}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: lang === "es" ? "es_ES" : "en_US",
      type: "article",
    },
  };
}

export default async function LessonPage(props: PageParams) {
  const { lng, moduleId, lessonId } = await props.params;
  return (
    <LessonPlayerClient lng={lng} moduleId={moduleId} lessonId={lessonId} />
  );
}
```

- [ ] **Step 3: Same split for the module page**

`git mv` the module `page.tsx` to `ModulePageClient.tsx`; adapt its props identically (props `{ lng: string; moduleId: string }`, delete the `use(props.params)` unwrap and unused import). New server `page.tsx`:

```tsx
import type { Metadata } from "next";
import { getModuleById } from "@/lib/constants/curriculum";
import { buildAlternates } from "@/lib/seo";
import ModulePageClient from "./ModulePageClient";

interface PageParams {
  params: Promise<{ lng: string; moduleId: string }>;
}

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const { lng, moduleId } = await props.params;
  const mod = getModuleById(moduleId);
  if (!mod) return {};

  const lang = lng === "es" ? "es" : "en";
  const title = mod.title[lang];
  const description = mod.description[lang];
  const alternates = buildAlternates(lng, `/learn/${moduleId}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      locale: lang === "es" ? "es_ES" : "en_US",
      type: "website",
    },
  };
}

export default async function ModulePage(props: PageParams) {
  const { lng, moduleId } = await props.params;
  return <ModulePageClient lng={lng} moduleId={moduleId} />;
}
```

- [ ] **Step 4: Verify metadata in served HTML (dev server, signed out)**

```bash
curl -s http://localhost:3000/es/learn/qaf-m1/qaf-m1-l1 | grep -o "<title>[^<]*</title>"
curl -s http://localhost:3000/es/learn/qaf-m1/qaf-m1-l1 | grep -o 'rel="canonical" href="[^"]*"'
curl -s http://localhost:3000/en/learn/qaf-m1 | grep -o "<title>[^<]*</title>"
```

Expected: the lesson's own bilingual title (suffixed `| PlayQAcademy` by the layout template), canonical pointing at `https://www.playqacademy.com/es/learn/qaf-m1/qaf-m1-l1`. Also re-run one signed-in smoke check in the browser (lesson renders, mark-complete works) since the props plumbing changed. Kill the dev server.

- [ ] **Step 5: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/app/[lng]/learn
git commit -m "feat(seo): per-page metadata for /learn via server/client split"
```

---

### Task 5: Signed-out lesson chrome — CTA card, free Next link, bookmark redirect

**Files:**
- Modify: `src/app/[lng]/learn/[moduleId]/[lessonId]/LessonPlayerClient.tsx`

**Interfaces:**
- Consumes: i18n keys from Task 3; `useAuth()`'s `{ user, loading: authLoading }` (already imported); `callbackUrl` convention: `/auth/sign-up?callbackUrl=<encodeURIComponent(current path)>` (system already end-to-end since the Ranking fix).
- Produces: the final signed-out UX. `anonymous = !authLoading && !user` is the gate for every change — during auth hydration the page keeps today's signed-in-shaped UI, so a logged-in user never sees a flash of the CTA.

- [ ] **Step 1: Add the shared derivations**

After the `lessonCompleted` line (`const lessonCompleted = persistedCompleted || justCompleted;`), add:

```tsx
  // Signed-out reader (QA Fundamentals is public — growth roadmap Phase 2).
  // Gated on !authLoading so a signed-in user never sees a flash of the
  // sign-up CTA during Firebase Auth hydration.
  const anonymous = !authLoading && !user;
  const signUpHref = `/${lng}/auth/sign-up?callbackUrl=${encodeURIComponent(
    `/${lng}/learn/${moduleId}/${lessonId}`
  )}`;
```

- [ ] **Step 2: Bookmark → sign-up when anonymous**

Replace the bookmark `<button>`'s `onClick={toggle}` with:

```tsx
              onClick={anonymous ? () => router.push(signUpHref) : toggle}
```

- [ ] **Step 3: CTA card at the end of the content area**

Immediately after the Resources block (after its closing `)}`), still inside the main content `<div>`, add:

```tsx
        {/* Signed-out: sign-up CTA where completion/progress would be */}
        {anonymous && (
          <div className="mt-10 rounded-xl border border-brand-forest-500/30 bg-brand-forest-500/10 p-6 text-center">
            <p className="text-base font-semibold text-[var(--color-text-primary)]">
              {t("lesson.player.signupCtaTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-text-muted)]">
              {t("lesson.player.signupCtaBody")}
            </p>
            <Link
              href={signUpHref}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-forest-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-forest-400"
            >
              {t("lesson.player.signupCtaButton")}
            </Link>
          </div>
        )}
```

- [ ] **Step 4: Bottom bar — hide mark-complete, free the Next link**

Replace the mark-complete `<Button>` block with a conditional (signed-in keeps the exact current button):

```tsx
          {/* Mark complete (signed-in) — anonymous readers get the CTA card above instead */}
          {anonymous ? (
            <div />
          ) : (
            <Button
              variant="primary"
              size="sm"
              disabled={lessonCompleted || authLoading}
              loading={completing}
              className={
                lessonCompleted
                  ? "!bg-brand-gold-600"
                  : "!bg-brand-gold-600 hover:!bg-brand-gold-500"
              }
              onClick={handleMarkComplete}
            >
              {lessonCompleted
                ? t("lesson.player.completed")
                : t("lesson.player.markComplete")}
            </Button>
          )}
```

Replace the Next block so anonymous readers get a real, always-enabled `<a>` (crawlable — Googlebot does not follow a disabled button's `router.push`), while signed-in keeps today's complete-to-unlock button:

```tsx
          {/* Next */}
          {nextLesson ? (
            anonymous ? (
              <Link
                href={`/${lng}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-terra-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-terra-400"
              >
                {t("lesson.player.next")}
                <ArrowRight />
              </Link>
            ) : (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight />}
                disabled={!lessonCompleted}
                className={
                  !lessonCompleted
                    ? ""
                    : "!bg-brand-terra-500 hover:!bg-brand-terra-400"
                }
                onClick={() => {
                  if (lessonCompleted) {
                    router.push(
                      `/${lng}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`
                    );
                  }
                }}
                title={
                  !lessonCompleted
                    ? t("lesson.player.completeToContinue")
                    : undefined
                }
              >
                {t("lesson.player.next")}
              </Button>
            )
          ) : (
            <div />
          )}
```

- [ ] **Step 5: Verify in the browser (dev server)**

Signed out, on `/es/learn/qaf-m1/qaf-m1-l1`: CTA card visible with ES copy; "Marcar como Completada" absent; "Siguiente Lección" clickable and navigates to `qaf-m1-l2`; bookmark click lands on sign-up with `callbackUrl` back to the lesson; repeat one page in `/en`. Signed in (test account): everything exactly as before — mark-complete → celebration → Next unlocks; no CTA card, no flash of it on a hard reload. Kill the dev server.

- [ ] **Step 6: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/app/[lng]/learn/[moduleId]/[lessonId]/LessonPlayerClient.tsx
git commit -m "feat(learn): signed-out reader UX — sign-up CTA, free next link, bookmark redirect"
```

---

### Task 6: Sitemap — derive the 110 QA Fundamentals URLs

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getCampusById("qaFundamentals")` from `@/lib/constants/campuses` (returns `Campus | null` with `moduleIds: string[]`), `getModuleById` from `@/lib/constants/curriculum`.
- Produces: sitemap entries for 10 module + 45 lesson routes × 2 locales (110 URLs) with hreflang alternates, alongside the existing 70.

- [ ] **Step 1: Derive the routes from the data layer**

In `src/app/sitemap.ts`, add the imports and route list (after `CAMPUS_ROUTES`):

```ts
import { getCampusById } from "@/lib/constants/campuses";
import { getModuleById } from "@/lib/constants/curriculum";
```

```ts
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
```

(Replace the existing `const ROUTES = [...STATIC_ROUTES, ...CAMPUS_ROUTES];` line.) Also update the header comment (lines 5-10): learn is no longer wholesale-excluded — QA Fundamentals routes are public and included.

- [ ] **Step 2: Verify the served sitemap**

`npm run dev`, then:

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"
curl -s http://localhost:3000/sitemap.xml | grep -c "learn/qaf-"
```

Expected: total `<loc>` count 174 (64 existing — 32 routes × 2 locales — + 110 new); `learn/qaf-` count 110 in `<loc>` entries (plus hreflang duplicates — if grepping raw, expect ≥110; the exact assert on 110 unique URLs happens in Task 7's script). Spot-check one lesson URL appears with both `hreflang` alternates. Kill the dev server.

- [ ] **Step 3: Quality gate + commit**

```bash
npm run typecheck && npm run lint && npm run build
git add src/app/sitemap.ts
git commit -m "feat(seo): QA Fundamentals module and lesson URLs in the sitemap"
```

---

### Task 7: Full verification against a production build

**Files:**
- Create: `<scratchpad>/check-open-qaf.mjs` (throwaway Playwright script — scratchpad, NOT the repo; global playwright via `createRequire("C:/Program Files/nodejs/node_modules/")`)

**Interfaces:**
- Consumes: everything above, running under `npm run build` + `npm run start` (production server, port 3000).

- [ ] **Step 1: Build and start production server** (no dev server running)

```bash
npm run build && npm run start
```

- [ ] **Step 2: Write and run the verification script** covering, per the spec's testing section:

1. **Served-HTML checks** (via `page.request.get`, i.e. pre-hydration): a `qaf-` lesson's HTML contains a known lesson-body phrase, its own `<title>`, and its canonical; a module page likewise.
2. **Gating:** `/es/learn/istqb-fundamentals` and `/es/learn/m1-typescript-foundations/m1-l1` respond with a redirect to sign-in (follow off, assert 307 + `callbackUrl`); all 10 `/es/learn/qaf-mX` return 200.
3. **robots.txt** contains `Allow: /*/learn/qaf-` and `Disallow: /*/learn/`.
4. **Sitemap:** parse, assert exactly 110 unique `/learn/qaf-` URLs, sample 10 of them (mix of modules/lessons/locales) and assert each returns 200.
5. **Zero Firestore traffic while anonymous:** `page.on("request")`, collect any URL containing `firestore.googleapis.com` or `firebaseio.com` while browsing a module page + 2 lessons signed-out; assert the list is empty.
6. **Anonymous UX:** CTA card present with ES and EN copy; mark-complete absent; Next is an `<a>` with the right `href` and clicking it lands on the next lesson; bookmark click lands on `/auth/sign-up?callbackUrl=...`; zero console errors throughout.
7. **Signed-in regression** (disposable/test account, credentials in shell env only per the established pattern): lesson renders, mark-complete awards and flips the button, Next unlocks, no CTA card at any point.

- [ ] **Step 3: Fix anything that fails, re-run to all-green, stop the server**

- [ ] **Step 4: Commit any fixes** (each with the quality gate) — if the script surfaced none, nothing to commit.

---

### Task 8: Docs sync + push

**Files:**
- Modify: `AGENTS.md` (Campus status → QA Fundamentals note that it is publicly readable; new "Verified in browser" item with the Task 7 evidence; Open items → growth roadmap Phase 2 marked done)
- Modify: `docs/superpowers/plans/2026-07-20-adsense-monetization-roadmap.md` (Status header line; Phase 2 checklist items → `[x]` with commit hashes)

- [ ] **Step 1: Update both docs** — AGENTS.md records: what opened, the prefix contract and its two enforcement points, the server/client split of the two `/learn/` routes (LessonPlayerClient/ModulePageClient), the signed-out UX, and the Task 7 verification summary as a numbered "Verified in browser" entry with commit hashes.

- [ ] **Step 2: Commit + push everything**

```bash
git add AGENTS.md docs/superpowers/plans/2026-07-20-adsense-monetization-roadmap.md
git commit -m "docs: record Phase 2 — QA Fundamentals opened publicly"
git push origin main
```

- [ ] **Step 3: Post-deploy spot-check against production** (~40s after push): `https://www.playqacademy.com/es/learn/qaf-m1` loads signed-out; a gated URL still redirects. Remember the known false-positive: automated checks on the custom domain can 503 while `playqacademy.vercel.app` serves 200 — cross-check there before diagnosing anything.

- [ ] **Step 4: In Search Console, request indexing** for `https://www.playqacademy.com/es/learn/qaf-m1` (Jorge, manual) and confirm the sitemap re-read shows the new URL count.
