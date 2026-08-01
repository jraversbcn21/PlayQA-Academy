/* eslint-disable react-hooks/rules-of-hooks */
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";

const CONTACT_EMAIL = "sidmaierlabs@gmail.com";

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
    title: t("contact.title"),
    description: t("contact.metaDescription"),
    alternates: buildAlternates(lng, "/contact"),
  };
}

export default async function ContactPage(props: PageParams) {
  const params = await props.params;

  const {
    lng
  } = params;

  const { t } = await useTranslation(lng, "common");

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
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
            {t("contact.backToHome")}
          </Link>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
          {t("contact.heading")}
        </h1>
        <p className="mb-8 leading-relaxed text-[var(--color-text-secondary)]">
          {t("contact.intro")}
        </p>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
          <p className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
            {t("contact.emailLabel")}
          </p>
          <p className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            {CONTACT_EMAIL}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center justify-center rounded-lg bg-brand-forest-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-forest-400"
          >
            {t("contact.emailCta")}
          </a>
        </div>

        <p className="mt-6 text-sm text-[var(--color-text-muted)]">
          {t("contact.responseNote")}
        </p>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {t("contact.legalNotePrefix")}{" "}
          <Link
            href={`/${lng}/privacy`}
            className="text-brand-forest-400 underline-offset-2 hover:underline"
          >
            {t("privacy.title")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
