/* eslint-disable react-hooks/rules-of-hooks */
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";

interface PageParams {
  params: Promise<{ lng: string }>;
}

export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const params = await props.params;

  const {
    lng
  } = params;

  const { t } = await useTranslation(lng, "common");
  return {
    title: t("terms.title"),
    description: t("terms.metaDescription"),
    alternates: buildAlternates(lng, "/terms"),
  };
}

export default async function TermsPage(props: PageParams) {
  const params = await props.params;

  const {
    lng
  } = params;

  const { t } = await useTranslation(lng, "common");

  const sections = [
    { heading: "terms.s1Heading", body: "terms.s1Body" },
    { heading: "terms.s2Heading", body: "terms.s2Body" },
    { heading: "terms.s3Heading", body: "terms.s3Body" },
    { heading: "terms.s4Heading", body: "terms.s4Body", list: "terms.s4List" },
    { heading: "terms.s5Heading", body: "terms.s5Body", list: "terms.s5List" },
    { heading: "terms.s6Heading", body: "terms.s6Body" },
    { heading: "terms.s7Heading", body: "terms.s7Body" },
    { heading: "terms.s8Heading", body: "terms.s8Body" },
    { heading: "terms.s9Heading", body: "terms.s9Body" },
    { heading: "terms.s10Heading", body: "terms.s10Body" },
    { heading: "terms.s11Heading", body: "terms.s11Body" },
    { heading: "terms.s12Heading", body: "terms.s12Body" },
    { heading: "terms.s13Heading", body: "terms.s13Body" },
    { heading: "terms.s14Heading", body: "terms.s14Body" },
  ];

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="sticky top-0 z-10 -mx-4 mb-10 bg-[var(--color-bg-primary)]/90 px-4 py-4 backdrop-blur-sm">
          <Link
            href={`/${lng}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t("terms.backToHome")}
          </Link>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {t("terms.title")}
        </h1>
        <p className="mb-12 text-sm text-[var(--color-text-secondary)]">
          {t("terms.lastUpdated")}
        </p>

        <div className="prose prose-invert max-w-none space-y-10">
          {sections.map((sec) => (
            <section key={sec.heading}>
              <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)] sm:text-2xl">
                {t(sec.heading)}
              </h2>
              <p className="mb-4 leading-relaxed text-[var(--color-text-secondary)]">
                {t(sec.body)}
              </p>
              {"list" in sec && sec.list ? (
                <ul className="mb-4 ml-6 list-disc space-y-2 text-[var(--color-text-secondary)]">
                  {(t(sec.list, { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
