"use client";

import { useState, use } from "react";
import Link from "next/link";
import { getSubCampuses } from "@/lib/constants/campuses";
import {
  getExercisesForCampus,
  type PlaygroundExercise,
  type ExerciseDifficulty,
} from "@/lib/constants/playground";
import Badge from "@/components/ui/Badge";
import SignupBanner from "@/components/playground/SignupBanner";

/* ------------------------------------------------------------------ */
/*  Exercise card                                                      */
/* ------------------------------------------------------------------ */

const DIFF_BORDER: Record<ExerciseDifficulty, string> = {
  beginner: "border-brand-gold-500/30",
  intermediate: "border-amber-500/30",
  advanced: "border-red-500/30",
};

const DIFF_BADGE: Record<ExerciseDifficulty, "success" | "warning" | "error"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "error",
};

function ExerciseCard({ exercise, lng }: { exercise: PlaygroundExercise; lng: string }) {
  const title = exercise.title[lng as "es" | "en"] ?? exercise.title.en;
  const desc = exercise.description[lng as "es" | "en"] ?? exercise.description.en;
  return (
    <Link
      href={`/${lng}${exercise.href}`}
      className={[
        "group rounded-xl border bg-[var(--color-bg-secondary)] p-5 transition-all hover:shadow-lg hover:border-brand-forest-500/40",
        DIFF_BORDER[exercise.difficulty],
      ].join(" ")}
    >
      <div className="mb-3 text-3xl">{exercise.icon}</div>
      <h3 className="mb-1 text-base font-semibold text-[var(--color-text-primary)] group-hover:text-brand-forest-400 transition-colors">
        {title}
      </h3>
      <p className="mb-3 text-xs leading-relaxed text-[var(--color-text-muted)]">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {exercise.modules.map((m) => (
          <Badge key={m} variant="info" size="sm">{m}</Badge>
        ))}
        <Badge variant={DIFF_BADGE[exercise.difficulty]} size="sm">
          {exercise.difficulty}
        </Badge>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

interface PageProps { params: Promise<{ lng: string }> }

export default function PlaygroundIndexClient(props: PageProps) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const [openCampusId, setOpenCampusId] = useState<string | null>(null);

  const campuses = getSubCampuses().map((campus) => ({
    campus,
    exercises: getExercisesForCampus(campus.id),
  }));

  const openEntry = campuses.find(
    ({ campus, exercises }) => campus.id === openCampusId && exercises.length > 0
  );

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-5xl">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
            {lng === "es" ? "Playground QA" : "QA Playground"}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {lng === "es"
              ? "Tu laboratorio práctico de QA"
              : "Your hands-on QA practice lab"}
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {lng === "es"
              ? "Elige un campus y practica conceptos específicos del currículum: ejercicios interactivos de QA e ISTQB, y páginas reales contra las que automatizar con Playwright."
              : "Pick a campus and practice specific curriculum concepts: interactive QA and ISTQB exercises, plus real pages to automate against with Playwright."}
          </p>
        </div>

        <SignupBanner lng={lng} />

        {/* Campus pill row */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {campuses.map(({ campus, exercises }) => {
            const hasExercises = exercises.length > 0;
            const isOpen = hasExercises && openCampusId === campus.id;
            const title = campus.title[lng as "es" | "en"] ?? campus.title.en;
            return (
              <button
                key={campus.id}
                type="button"
                disabled={!hasExercises}
                onClick={() => hasExercises && setOpenCampusId(isOpen ? null : campus.id)}
                aria-expanded={isOpen}
                className={[
                  "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                  !hasExercises
                    ? "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] opacity-50"
                    : isOpen
                      ? "border-brand-forest-500/30 bg-brand-forest-500/10 text-brand-forest-400"
                      : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}
              >
                <span className="truncate text-left">{title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {hasExercises ? (
                    <>
                      <span className="rounded-full bg-brand-forest-500/15 px-2 py-0.5 text-xs font-medium text-brand-forest-400">
                        {exercises.length}
                      </span>
                      <svg
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <Badge variant="warning" size="sm">
                      {lng === "es" ? "Próximamente" : "Coming Soon"}
                    </Badge>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Open campus panel */}
        {openEntry && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {openEntry.campus.title[lng as "es" | "en"] ?? openEntry.campus.title.en}
              </h2>
              <Link
                href={`/${lng}/campus/${openEntry.campus.id}`}
                className="shrink-0 text-sm font-medium text-brand-forest-400 hover:underline"
              >
                {lng === "es" ? "Ver campus →" : "View campus →"}
              </Link>
            </div>
            {openEntry.campus.id === "automation" && (
              <Link
                href={`/${lng}/playground/setup`}
                className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-brand-gold-500/30 bg-brand-gold-500/10 px-4 py-3 transition-colors hover:border-brand-gold-500/60"
              >
                <span className="text-sm text-[var(--color-text-secondary)]">
                  <span className="mr-2">⚙️</span>
                  {lng === "es"
                    ? "Para estos ejercicios necesitas Playwright en tu máquina."
                    : "These exercises require Playwright on your machine."}
                </span>
                <span className="shrink-0 text-sm font-medium text-brand-gold-600 hover:underline">
                  {lng === "es" ? "Guía de Setup (5 min) →" : "Setup Guide (5 min) →"}
                </span>
              </Link>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {openEntry.exercises.map((exercise) => (
                <ExerciseCard key={exercise.href} exercise={exercise} lng={lng} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
