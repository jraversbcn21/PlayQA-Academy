import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
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
  const mod = getModuleById(moduleId);
  if (!mod) notFound();

  const cookieStore = await cookies();
  const hasAuthCookie = !!cookieStore.get("auth_token")?.value;

  return (
    <ModulePageClient
      lng={lng}
      moduleId={moduleId}
      initialAnonymous={!hasAuthCookie}
    />
  );
}
