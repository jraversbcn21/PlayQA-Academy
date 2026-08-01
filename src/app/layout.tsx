import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Chakra_Petch, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/constants/site";
import "./globals.css";

/* Plus Jakarta Sans — base body font across the app */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

/* Chakra Petch — display font for large hero headlines */
const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-chakra-petch",
  display: "swap",
});

/* Space Grotesk — heading font for the logo wordmark and card titles */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

/* JetBrains Mono for code snippets / terminal-style content in lessons */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | PlayQAcademy",
    default: "PlayQAcademy — Domina el QA de software",
  },
  description:
    "Aprende QA desde cero hasta la automatización: Fundamentos de QA, certificación ISTQB CTFL y automatización con Playwright y TypeScript, todo en una sola plataforma.",
  keywords: [
    "QA",
    "testing de software",
    "ISTQB",
    "ISTQB CTFL",
    "Playwright",
    "TypeScript",
    "automatización de pruebas",
    "PlayQAcademy",
  ],
  openGraph: {
    title: "PlayQAcademy — Domina el QA de software",
    description:
      "Fundamentos de QA, certificación ISTQB CTFL y automatización con Playwright. Tu carrera en QA comienza aquí.",
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayQAcademy",
    description:
      "Master software QA: Fundamentals, ISTQB CTFL certification, and Playwright automation — all in one platform.",
  },
  verification: {
    google: "RsYx-WL1f6CCPuZ8JqsA50XOEVaNDCZfI1fdDxW1wCY",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${chakraPetch.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} light`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the persisted theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.remove('light')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
