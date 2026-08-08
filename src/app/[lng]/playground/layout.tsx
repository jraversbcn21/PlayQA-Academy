"use client";
import { use } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PLAYGROUND_EXERCISES } from "@/lib/constants/playground";
import { getCampusById } from "@/lib/constants/campuses";

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

interface PlaygroundLayoutProps {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}

export default function PlaygroundLayout(props: PlaygroundLayoutProps) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const {
    children
  } = props;

  const pathname = usePathname();

  const isIndex = pathname === `/${lng}/playground`;
  const isSetup = pathname === `/${lng}/playground/setup`;
  const showBreadcrumb = !isIndex && !isSetup;

  const currentExercise = PLAYGROUND_EXERCISES.find((ex) => pathname.startsWith(`/${lng}${ex.href}`));
  // The setup guide is Playwright-specific, so treat it as belonging to "automation" for nav purposes.
  const activeCampusId = currentExercise?.campusId ?? (isSetup ? "automation" : null);
  const currentCampus = activeCampusId ? getCampusById(activeCampusId) : null;
  const visibleExercises = activeCampusId
    ? PLAYGROUND_EXERCISES.filter((ex) => ex.campusId === activeCampusId)
    : PLAYGROUND_EXERCISES;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb — shown inside an exercise, not on the index or setup guide */}
      {showBreadcrumb && (
        <div className="container-app px-4 pt-4">
          <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
            <Link href={`/${lng}/playground`} className="hover:text-[var(--color-text-primary)] transition-colors">
              Playground
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-[var(--color-text-secondary)]">
              {currentCampus
                ? (currentCampus.title[lng as "es" | "en"] ?? currentCampus.title.en)
                : (lng === "es" ? "Automatización" : "Automation")}
            </span>
          </nav>
        </div>
      )}

      {/* Sub-nav — hidden on the index, where the campus accordion is the navigator */}
      {!isIndex && (
        <div className="sticky top-16 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-lg">
        <nav className="container-app flex flex-wrap justify-center gap-1.5 py-2" role="navigation" aria-label="Playground exercises">
          <Link
            href={`/${lng}/playground`}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              pathname === `/${lng}/playground`
                ? "bg-brand-forest-600 text-white"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
            ].join(" ")}
          >
            🏠 {lng === "es" ? "Inicio" : "Home"}
          </Link>
          {visibleExercises.map((ex) => {
            const fullHref = `/${lng}${ex.href}`;
            const isActive = pathname.startsWith(fullHref);
            const label = ex.title[lng as "es" | "en"] ?? ex.title.en;
            return (
              <Link
                key={ex.href}
                href={fullHref}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1",
                  isActive
                    ? "bg-brand-forest-600 text-white"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}
                title={label}
              >
                <span aria-hidden="true">{ex.icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        </div>
      )}
      {children}
    </div>
  );
}
