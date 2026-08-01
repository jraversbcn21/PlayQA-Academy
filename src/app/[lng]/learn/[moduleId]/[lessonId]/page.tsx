import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
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
  const mod = getModuleById(moduleId);
  const lesson = getLessonById(moduleId, lessonId);
  if (!mod || !lesson) notFound();

  const cookieStore = await cookies();
  const hasAuthCookie = !!cookieStore.get("auth_token")?.value;

  return (
    <LessonPlayerClient
      lng={lng}
      moduleId={moduleId}
      lessonId={lessonId}
      initialAnonymous={!hasAuthCookie}
    />
  );
}
