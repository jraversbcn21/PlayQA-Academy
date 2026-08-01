"use client";

import { useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/lib/hooks/useProgress";
import { useGamification } from "@/lib/hooks/useGamification";
import { useGamificationUI } from "@/context/GamificationContext";
import { getLevelFromPoints } from "@/lib/gamification/levels";
import {
  useLesson,
  useLessonNavigation,
  markLessonComplete,
  useBookmarked,
} from "@/lib/hooks/useLesson";
import LessonRenderer from "@/components/lesson/LessonRenderer";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function ArrowLeft(): ReactNode {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ArrowRight(): ReactNode {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }): ReactNode {
  return (
    <svg
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

function ClockIcon(): ReactNode {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Confetti mini-animation                                            */
/* ------------------------------------------------------------------ */

function CompletedBanner(): ReactNode {
  return (
    <div className="animate-fade-in-up rounded-xl border border-brand-gold-500/20 bg-brand-gold-500/10 p-4 text-center">
      <p className="text-base font-semibold text-brand-gold-400">
        🎉 Lesson completed! +10 points
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Your progress has been saved.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

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
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getLessonStatus, progressData } = useProgress(user?.uid);
  const { data: gData } = useGamification(user?.uid);
  const { queueBadges, triggerLevelUp } = useGamificationUI();

  const { content, meta, exists } = useLesson(moduleId, lessonId);
  const { prevLesson, nextLesson } = useLessonNavigation(moduleId, lessonId);
  const { bookmarked, toggle, loading: bookmarkLoading } = useBookmarked(
    user?.uid,
    moduleId,
    lessonId
  );

  // `progressData` loads asynchronously from Firestore; deriving completion
  // live (instead of freezing it in a useState initializer) avoids showing
  // "Mark Complete" again — and re-awarding points — on an already-completed
  // lesson when progress hasn't finished loading yet at mount time.
  const [justCompleted, setJustCompleted] = useState(false);
  const persistedCompleted =
    !!user && getLessonStatus(moduleId, lessonId) === "completed";
  const lessonCompleted = persistedCompleted || justCompleted;
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleMarkComplete = useCallback(async () => {
    if (!user || lessonCompleted) return;
    setCompleting(true);
    try {
      const totalCompleted = progressData?.totalCompletedLessons ?? 0;
      const completedMods = (progressData?.modules ?? [])
        .filter((m) => m.status === "completed")
        .map((m) => m.module.id);

      // progressData reflects state BEFORE this lesson is marked complete, so
      // a module that's about to reach 100% with this lesson isn't yet
      // flagged "completed" above. Add it here so module-completion badges
      // fire immediately instead of waiting for the next gamification event.
      const currentModInfo = progressData?.modules.find((m) => m.module.id === moduleId);
      if (
        currentModInfo &&
        currentModInfo.status !== "completed" &&
        currentModInfo.completedLessonCount + 1 >= currentModInfo.totalLessonCount &&
        !completedMods.includes(moduleId)
      ) {
        completedMods.push(moduleId);
      }

      const result = await markLessonComplete(
        user.uid, moduleId, lessonId,
        totalCompleted + 1,
        completedMods,
        gData?.currentStreak ?? 0
      );

      setJustCompleted(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);

      // Trigger gamification modals
      if (result.newBadges.length > 0) {
        queueBadges(result.newBadges);
      }
      if (result.levelChanged) {
        const ol = getLevelFromPoints(result.totalPoints - 10);
        const nl = getLevelFromPoints(result.totalPoints);
        triggerLevelUp(ol, nl);
      }
    } catch {
      // Silently fail — progress will sync on next load
    } finally {
      setCompleting(false);
    }
  }, [user, moduleId, lessonId, lessonCompleted, progressData, gData, queueBadges, triggerLevelUp]);

  // Not found state
  if (!exists) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-[var(--color-text-muted)]">
          {lng === "es" ? "Lección no encontrada." : "Lesson not found."}
        </p>
      </div>
    );
  }

  if (!meta || !content) return null;

  const modTitle = meta.moduleTitle[lng as "es" | "en"] ?? meta.moduleTitle.en;
  const lesTitle = meta.title[lng as "es" | "en"] ?? meta.title.en;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          {/* Breadcrumb */}
          <nav className="hidden min-w-0 flex-1 items-center gap-1.5 text-xs text-[var(--color-text-muted)] sm:flex">
            <Link
              href={`/${lng}/dashboard`}
              className="shrink-0 transition-colors hover:text-[var(--color-text-primary)]"
            >
              {t("lesson.breadcrumb.dashboard")}
            </Link>
            <span>/</span>
            <Link
              href={`/${lng}/learn/${moduleId}`}
              className="shrink-0 transition-colors hover:text-[var(--color-text-primary)]"
            >
              {modTitle}
            </Link>
            <span>/</span>
            <span className="truncate text-[var(--color-text-primary)]">
              {t("lesson.breadcrumb.lesson")} {meta.lessonNumber}
            </span>
          </nav>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="hidden sm:inline">
              {t("lesson.player.lessonOf", {
                current: meta.lessonNumber,
                total: meta.totalInModule,
              })}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon />
              ~{meta.estimatedMinutes} min
            </span>

            {/* Bookmark */}
            <button
              type="button"
              disabled={bookmarkLoading}
              onClick={toggle}
              className={[
                "rounded p-1 transition-colors hover:bg-[var(--color-bg-elevated)]",
                bookmarked
                  ? "text-brand-forest-400"
                  : "text-[var(--color-text-muted)]",
              ].join(" ")}
              aria-label={bookmarked ? t("lesson.player.bookmarked") : t("lesson.player.bookmark")}
            >
              <BookmarkIcon filled={bookmarked} />
            </button>
          </div>
        </div>

        {/* Progress bar at top */}
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <ProgressBar
            value={Math.round((meta.lessonNumber / meta.totalInModule) * 100)}
            size="sm"
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Celebration banner */}
        {showCelebration && (
          <div className="mb-6">
            <CompletedBanner />
          </div>
        )}

        {/* Lesson title */}
        <h1 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          {lesTitle}
        </h1>
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          {(meta.description[lng as "es" | "en"] ?? meta.description.en)}
        </p>

        {/* Render lesson sections */}
        <div className="max-w-none">
          <LessonRenderer sections={content.sections} lng={lng} moduleId={meta.moduleId} lessonId={meta.id} />
        </div>

        {/* Resources */}
        {content.resources && content.resources.length > 0 && (
          <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
              {t("lesson.player.resources")}
            </h3>
            <ul className="space-y-2">
              {content.resources.map((res, idx) => (
                <li key={idx}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-brand-forest-400 transition-colors hover:text-brand-forest-300"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {res.title[lng as "es" | "en"] ?? res.title.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Bottom navigation ───────────────────────────────── */}
      <div className="sticky bottom-0 z-20 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* Previous */}
          {prevLesson ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft />}
              onClick={() =>
                router.push(
                  `/${lng}/learn/${prevLesson.moduleId}/${prevLesson.lessonId}`
                )
              }
            >
              {t("lesson.player.previous")}
            </Button>
          ) : (
            <div />
          )}

          {/* Mark complete */}
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

          {/* Next */}
          {nextLesson ? (
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
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
