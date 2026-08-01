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
