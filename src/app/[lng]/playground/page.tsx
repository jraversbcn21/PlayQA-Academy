/* eslint-disable react-hooks/rules-of-hooks */
import type { Metadata } from "next";
import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";
import PlaygroundIndexClient from "./PlaygroundIndexClient";

interface PageProps {
  params: Promise<{ lng: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lng } = await props.params;
  const { t } = await useTranslation(lng, "common");
  const alternates = buildAlternates(lng, "/playground");

  return {
    title: t("playground.title"),
    description: t("playground.subtitle"),
    alternates,
    openGraph: {
      title: t("playground.title"),
      description: t("playground.subtitle"),
      url: alternates.canonical,
      locale: lng === "es" ? "es_ES" : "en_US",
      type: "website",
    },
  };
}

export default function PlaygroundPage(props: PageProps) {
  // Suspense boundary required by useSearchParams (the ?campus= pre-open)
  // on a statically prerendered page.
  return (
    <Suspense>
      <PlaygroundIndexClient params={props.params} />
    </Suspense>
  );
}
