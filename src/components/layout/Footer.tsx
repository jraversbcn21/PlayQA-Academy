"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FooterColumn {
  titleKey: string;
  links: { labelKey: string; href: string }[];
}

interface FooterProps {
  currentLng: string;
}

/* ------------------------------------------------------------------ */
/*  Social icon SVGs                                                   */
/* ------------------------------------------------------------------ */

function GitHubIcon(): ReactNode {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedInIcon(): ReactNode {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon(): ReactNode {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.337 3.608 1.311.974.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.069 4.85c-.062 1.366-.337 2.633-1.311 3.608-.975.974-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.069c-1.366-.062-2.633-.337-3.608-1.311-.974-.975-1.249-2.242-1.311-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.069-4.85c.062-1.366.337-2.633 1.311-3.608.975-.974 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0 1.948c-3.144 0-3.508.012-4.71.067-1.103.05-1.703.234-2.101.39-.529.205-.906.45-1.303.847-.397.397-.642.774-.847 1.303-.156.398-.34.998-.39 2.1-.055 1.203-.067 1.567-.067 4.711 0 3.144.012 3.508.067 4.71.05 1.103.234 1.703.39 2.101.205.529.45.906.847 1.303.397.397.774.642 1.303.847.398.156.998.34 2.1.39 1.203.055 1.567.067 4.711.067 3.144 0 3.508-.012 4.71-.067 1.103-.05 1.703-.234 2.101-.39.529-.205.906-.45 1.303-.847.397-.397.642-.774.847-1.303.156-.398.34-.998.39-2.1.055-1.203.067-1.567.067-4.711 0-3.144-.012-3.508-.067-4.71-.05-1.103-.234-1.703-.39-2.101a3.508 3.508 0 00-.847-1.303 3.508 3.508 0 00-1.303-.847c-.398-.156-.998-.34-2.1-.39-1.203-.055-1.567-.067-4.711-.067zM12 7.378a4.622 4.622 0 110 9.244 4.622 4.622 0 010-9.244zm0 1.946a2.676 2.676 0 100 5.352 2.676 2.676 0 000-5.352zm5.884-2.176a1.08 1.08 0 11-2.16 0 1.08 1.08 0 012.16 0z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Social links                                                       */
/* ------------------------------------------------------------------ */

/**
 * Single source for the social profiles. Both the icon row in the brand
 * column and the "Community" link column read from here, so the two can't
 * drift apart.
 */
const SOCIAL_LINKS = [
  {
    labelKey: "footer.community.github",
    href: "https://github.com/jraversbcn21",
    icon: <GitHubIcon />,
  },
  {
    labelKey: "footer.community.linkedin",
    href: "https://www.linkedin.com/in/jorge-carre%C3%B1o-dam/",
    icon: <LinkedInIcon />,
  },
  {
    labelKey: "footer.community.instagram",
    href: "https://instagram.com/qatester.ai",
    icon: <InstagramIcon />,
  },
];

/* ------------------------------------------------------------------ */
/*  Footer columns data                                                */
/* ------------------------------------------------------------------ */

function getFooterColumns(): FooterColumn[] {
  return [
    {
      titleKey: "footer.learn.title",
      links: [
        { labelKey: "footer.learn.glossary", href: "/glossary" },
        { labelKey: "footer.learn.curriculum", href: "/curriculum" },
        { labelKey: "footer.learn.playground", href: "/playground" },
      ],
    },
    {
      titleKey: "footer.community.title",
      links: [
        ...SOCIAL_LINKS.map(({ labelKey, href }) => ({ labelKey, href })),
        { labelKey: "footer.community.istqb", href: "https://mycampusistqb.vercel.app/" },
      ],
    },
    {
      titleKey: "footer.legal.title",
      links: [
        { labelKey: "footer.legal.privacy", href: "/privacy" },
        { labelKey: "footer.legal.terms", href: "/terms" },
        { labelKey: "footer.legal.cookies", href: "/cookies" },
        { labelKey: "footer.legal.contact", href: "/contact" },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Footer component                                                   */
/* ------------------------------------------------------------------ */

export default function Footer({ currentLng }: FooterProps) {
  const { t } = useTranslation("common");
  const currentYear = new Date().getFullYear();
  const columns = getFooterColumns();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="container-app py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href={`/${currentLng}`}
              className="inline-flex items-center gap-2 text-lg font-bold text-[var(--color-text-primary)]"
            >
              <svg
                viewBox="0 0 28 28"
                className="h-7 w-7"
                fill="none"
                aria-hidden="true"
              >
                <path d="M14 2L26 24H2L14 2Z" fill="currentColor" className="text-brand-forest-500" />
              </svg>
              PlayQ
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-forest-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-forest-500" />
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              {t("footer.tagline")}
            </p>

            {/* Social links */}
            <div className="mt-5 flex gap-4">
              {SOCIAL_LINKS.map(({ icon, labelKey, href }) => (
                <a
                  key={labelKey}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(labelKey)}
                  className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t(col.titleKey)}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  const className =
                    "text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]";

                  return (
                    <li key={link.labelKey}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {t(link.labelKey)}
                        </a>
                      ) : (
                        <Link href={`/${currentLng}${link.href}`} className={className}>
                          {t(link.labelKey)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-[var(--color-border)] pt-6">
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            {t("footer.copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
