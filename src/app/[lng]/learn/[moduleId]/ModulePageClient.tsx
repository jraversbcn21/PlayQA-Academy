"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/lib/hooks/useProgress";
import { getModuleById } from "@/lib/constants/curriculum";
import { getCampusForModule } from "@/lib/constants/campuses";
import type { CurriculumLesson } from "@/lib/constants/curriculum";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function CheckIcon(): ReactNode {
  return (
    <svg className="h-4 w-4 text-brand-gold-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayIcon(): ReactNode {
  return (
    <svg className="h-4 w-4 text-brand-forest-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />
    </svg>
  );
}

function LockIcon(): ReactNode {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function LessonStatusIcon({ status }: { status: "completed" | "available" | "locked" }) {
  if (status === "completed") return <CheckIcon />;
  if (status === "available") return <PlayIcon />;
  return <LockIcon />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

interface ModulePageClientProps {
  lng: string;
  moduleId: string;
}

export default function ModulePageClient({
  lng,
  moduleId,
}: ModulePageClientProps) {
  const { t: tFn } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();
  const { isModuleUnlocked, getLessonStatus, progressData } = useProgress(
    user?.uid
  );

  const mod = getModuleById(moduleId);
  const unlocked = isModuleUnlocked(moduleId);

  if (!mod) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">
          {lng === "es" ? "Módulo no encontrado." : "Module not found."}
        </p>
      </div>
    );
  }

  const title = mod.title[lng as "es" | "en"] ?? mod.title.en;
  const description = mod.description[lng as "es" | "en"] ?? mod.description.en;
  const campus = getCampusForModule(moduleId);
  const campusPosition = campus?.moduleIds.indexOf(moduleId) ?? -1;
  const campusRelativeNumber = campusPosition >= 0 ? campusPosition + 1 : mod.order;
  const prevModTitle = (() => {
    if (!campus) return null;
    if (campusPosition <= 0) return null;
    const prevModuleId = campus.moduleIds[campusPosition - 1];
    if (!prevModuleId) return null;
    const prev = getModuleById(prevModuleId);
    if (!prev) return null;
    return prev.title[lng as "es" | "en"] ?? prev.title.en;
  })();

  const modProgress = progressData?.modules.find(
    (m) => m.module.id === moduleId
  );
  const percent = modProgress?.percentComplete ?? 0;

  // Find first available lesson for CTA
  const firstAvailableLesson = mod.lessons.find((les) => {
    const status = getLessonStatus(moduleId, les.id);
    return status === "available" || status === "completed";
  });

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link
            href={`/${lng}/dashboard`}
            className="transition-colors hover:text-[var(--color-text-primary)]"
          >
            {tFn("lesson.breadcrumb.dashboard")}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">
            {tFn("lesson.breadcrumb.module")} {campusRelativeNumber}
          </span>
        </nav>

        {/* Locked state */}
        {!unlocked && prevModTitle && (
          <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-400">
              {lng === "es"
                ? `Completa "${prevModTitle}" para desbloquear este módulo.`
                : `Complete "${prevModTitle}" to unlock this module.`}
            </p>
          </div>
        )}

        {/* Hero header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <Badge
              variant={
                mod.difficulty === "beginner"
                  ? "success"
                  : mod.difficulty === "intermediate"
                    ? "warning"
                    : "error"
              }
              size="sm"
            >
              {mod.difficulty}
            </Badge>
            <span className="text-xs text-[var(--color-text-muted)]">
              {mod.lessons.length} {tFn("lesson.moduleOverview.lessons")} &middot; ~{mod.estimatedMinutes} min
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>

        {/* CTA + Progress */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <ProgressBar value={percent} size="md" showLabel />
          </div>
          {unlocked && firstAvailableLesson && (
            <Button
              variant="primary"
              className="!bg-brand-terra-500 hover:!bg-brand-terra-400 shrink-0"
              onClick={() =>
                router.push(`/${lng}/learn/${moduleId}/${firstAvailableLesson.id}`)
              }
            >
              {percent > 0 && percent < 100
                ? tFn("lesson.moduleOverview.continueModule")
                : tFn("lesson.moduleOverview.startModule")}
            </Button>
          )}
        </div>

        {/* Lesson list */}
        <div className="space-y-1">
          {mod.lessons.map((lesson: CurriculumLesson, idx: number) => {
            const status = getLessonStatus(moduleId, lesson.id);
            const lTitle =
              lesson.title[lng as "es" | "en"] ?? lesson.title.en;

            const rowStyle = (() => {
              if (status === "locked") return "opacity-50 cursor-not-allowed";
              if (status === "completed") return "hover:bg-brand-gold-500/5";
              return "hover:bg-[var(--color-bg-elevated)] cursor-pointer";
            })();

            return (
              <div
                key={lesson.id}
                className={[
                  "flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3.5 transition-colors",
                  rowStyle,
                ].join(" ")}
                onClick={() => {
                  if (status !== "locked") {
                    router.push(`/${lng}/learn/${moduleId}/${lesson.id}`);
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && status !== "locked") {
                    router.push(`/${lng}/learn/${moduleId}/${lesson.id}`);
                  }
                }}
                role={status !== "locked" ? "button" : "presentation"}
                tabIndex={status !== "locked" ? 0 : -1}
              >
                {/* Status icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]">
                  <LessonStatusIcon status={status} />
                </div>

                {/* Lesson info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-[var(--color-text-muted)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {lTitle}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ~{lesson.estimatedMinutes} min
                  </span>
                  {status === "locked" && (
                    <Badge variant="locked" size="sm">
                      {tFn("lesson.moduleOverview.locked")}
                    </Badge>
                  )}
                  {status === "completed" && (
                    <Badge variant="success" size="sm">
                      {tFn("lesson.moduleOverview.completed")}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
