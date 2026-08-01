/**
 * PlayQ Academy — Campus definitions.
 *
 * A Campus is a derived grouping layer over modules. It is defined in
 * exactly one place: this file. Progress, exams, and badges keep
 * referencing modules. Anything campus-level is derived, never duplicated.
 *
 * Three campuses:
 *   1. QA Fundamentals (NEW — placeholder content)
 *   2. ISTQB CTFL Foundation (ported from MyCampus)
 *   3. Playwright + TypeScript Automation (existing 8 modules)
 */

import type { Campus, QaCampus } from "@/types/campus";

/* ------------------------------------------------------------------ */
/*  Feature flags                                                      */
/* ------------------------------------------------------------------ */

/**
 * When false, all modules are unlocked regardless of progress.
 * When true, modules unlock only after completing the previous module
 * within the same campus.
 */
export const ENFORCE_MODULE_LOCKING = false;

/* ------------------------------------------------------------------ */
/*  QA Campus (root hub)                                               */
/* ------------------------------------------------------------------ */

/**
 * The neutral root hub. The landing page ("/[lng]") presents this as
 * the entry point, with the three campuses below as equal sub-campuses.
 */
export const QA_CAMPUS: QaCampus = {
  id: "qa",
  title: {
    es: "Campus QA",
    en: "QA Campus",
  },
  description: {
    es: "El punto de partida para tu carrera en QA: Fundamentos, ISTQB CTFL y Automatización con Playwright en un solo lugar.",
    en: "Your starting point for a QA career: Fundamentals, ISTQB CTFL, and Playwright Automation all in one place.",
  },
};

/* ------------------------------------------------------------------ */
/*  Campus definitions                                                 */
/* ------------------------------------------------------------------ */

export const CAMPUSES: Campus[] = [
  {
    id: "qaFundamentals",
    order: 1,
    title: {
      es: "Fundamentos de QA",
      en: "QA Fundamentals",
    },
    description: {
      es: "Introducción al testing de software y conceptos esenciales para comenzar tu carrera en QA.",
      en: "Introduction to software testing and essential concepts to start your QA career.",
    },
    // CONTRACT: these ids all start with "qaf-", and only this campus's ids
    // may ever use that prefix. middleware.ts and robots.ts expose
    // /learn/qaf-* publicly based on it — a future campus whose module ids
    // began with "qaf-" would silently become public.
    moduleIds: [
      "qaf-m1",
      "qaf-m2",
      "qaf-m3",
      "qaf-m4",
      "qaf-m5",
      "qaf-m6",
      "qaf-m7",
      "qaf-m8",
      "qaf-m9",
      "qaf-m10",
    ],
    status: "active",
  },
  {
    id: "istqb",
    order: 2,
    title: {
      es: "ISTQB CTFL Foundation",
      en: "ISTQB CTFL Foundation",
    },
    description: {
      es: "Certificación ISTQB Foundation Level v4.0 — El estándar internacional en testing de software.",
      en: "ISTQB Foundation Level v4.0 Certification — The international standard in software testing.",
    },
    moduleIds: [
      "istqb-fundamentals",
      "istqb-sdlc",
      "istqb-static-testing",
      "istqb-test-analysis",
      "istqb-management",
      "istqb-tools",
    ],
    status: "active",
  },
  {
    id: "automation",
    order: 3,
    title: {
      es: "Automatización con Playwright",
      en: "Playwright Automation",
    },
    description: {
      es: "De QA Manual a QA Automation. Aprende Playwright y TypeScript con 8 módulos y 41 lecciones.",
      en: "From Manual QA to QA Automation. Learn Playwright and TypeScript with 8 modules and 41 lessons.",
    },
    moduleIds: [
      "m1-typescript-foundations",
      "m2-playwright-fundamentals",
      "m3-locators-selectors",
      "m4-actions-assertions",
      "m5-page-object-model",
      "m6-configuration-environments",
      "m7-api-testing",
      "m8-cicd-reporting",
    ],
    status: "active",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Find the campus that contains the given module ID.
 * Returns null if no campus contains the module.
 */
export function getCampusForModule(moduleId: string): Campus | null {
  return CAMPUSES.find((campus) => campus.moduleIds.includes(moduleId)) ?? null;
}

/**
 * Get all modules for a given campus ID.
 * Returns an empty array if the campus is not found.
 */
export function getModulesForCampus(campusId: string): string[] {
  const campus = CAMPUSES.find((c) => c.id === campusId);
  return campus?.moduleIds ?? [];
}

/**
 * Get a campus by its semantic ID.
 */
export function getCampusById(campusId: string): Campus | null {
  return CAMPUSES.find((c) => c.id === campusId) ?? null;
}

/**
 * Get all sub-campuses (QA Fundamentals, ISTQB, Automation) ordered by
 * their display order, for rendering under the QA Campus hub.
 */
export function getSubCampuses(): Campus[] {
  return [...CAMPUSES].sort((a, b) => a.order - b.order);
}
