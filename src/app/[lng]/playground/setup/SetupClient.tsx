"use client";
import { use } from "react";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function SetupClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://playqacademy.com";
  const playgroundUrl = `${baseUrl}/${lng}/playground`;

  const steps = [
    {
      titleEs: "1. Crea o clona un proyecto Playwright",
      titleEn: "1. Create or clone a Playwright project",
      code: "npm init playwright@latest\n# or in existing project:\nnpm install -D @playwright/test\nnpx playwright install",
      descEs: "Ejecuta este comando en tu terminal. Elige TypeScript cuando pregunte. Esto crea playwright.config.ts, una carpeta tests/ y archivos de ejemplo.",
      descEn: "Run this command in your terminal. Choose TypeScript when prompted. This creates playwright.config.ts, a tests/ folder, and example files.",
    },
    {
      titleEs: "2. Configura baseURL en playwright.config.ts",
      titleEn: "2. Configure baseURL in playwright.config.ts",
      code: `import { defineConfig } from '@playwright/test';\n\nexport default defineConfig({\n  use: {\n    // La barra final es importante\n    baseURL: '${playgroundUrl}/',\n    // other options...\n  },\n});`,
      descEs: "Abre playwright.config.ts y añade la propiedad `baseURL` dentro de `use`. La barra final (`/`) es imprescindible: permite que las rutas relativas sin barra inicial — page.goto('login') — resuelvan dentro del Playground. Con page.goto('/login') (barra inicial) la URL se resuelve desde la raíz del dominio y el test fallaría con 404.",
      descEn: "Open playwright.config.ts and add the `baseURL` property inside `use`. The trailing slash matters: it lets relative paths without a leading slash — page.goto('login') — resolve inside the Playground. With page.goto('/login') (leading slash) the URL resolves from the domain root and the test would fail with a 404.",
    },
    {
      titleEs: "3. Plantilla de tu primer test",
      titleEn: "3. First test template",
      code: lng === "es"
        ? `import { test, expect } from '@playwright/test';\n\ntest('login con credenciales válidas', async ({ page }) => {\n  await page.goto('login');\n\n  // Localiza los campos por su etiqueta accesible\n  await page.getByLabel('Email').fill('student@playq.test');\n  await page.getByLabel('Password').fill('Playwright123!');\n\n  // Localiza el botón por su rol y nombre accesible\n  // (acotado al formulario: el navbar tiene otro botón "Iniciar sesión")\n  await page.locator('form').getByRole('button', { name: 'Iniciar Sesión' }).click();\n\n  // El login muestra el mensaje de éxito en la misma página (no navega)\n  await expect(page.getByRole('heading', { name: '¡Inicio de sesión exitoso!' })).toBeVisible();\n  await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();\n});`
        : `import { test, expect } from '@playwright/test';\n\ntest('login with valid credentials', async ({ page }) => {\n  await page.goto('login');\n\n  // Find elements by their accessible label\n  await page.getByLabel('Email').fill('student@playq.test');\n  await page.getByLabel('Password').fill('Playwright123!');\n\n  // Find the submit button by its role and accessible name\n  // (scoped to the form: the navbar has its own "Sign in" button)\n  await page.locator('form').getByRole('button', { name: 'Sign In' }).click();\n\n  // Login shows the success message on the same page (no navigation)\n  await expect(page.getByRole('heading', { name: 'Login Successful!' })).toBeVisible();\n  await expect(page.getByText('Welcome back')).toBeVisible();\n});`,
      descEs: "Copia este test en tests/playground.spec.ts. Usa getByRole, getByLabel y getByText — las estrategias de localización recomendadas por Playwright. Ojo: los textos del ejercicio dependen del idioma de la página; esta plantilla apunta a la versión en español (/es/).",
      descEn: "Copy this test into tests/playground.spec.ts. Use getByRole, getByLabel, and getByText — Playwright's recommended locator strategies. Note: the exercise texts depend on the page language; this template targets the English version (/en/).",
    },
    {
      titleEs: "4. Ejecuta tus tests",
      titleEn: "4. Run your tests",
      code: "# Ejecutar todos los tests\nnpx playwright test\n\n# Ejecutar un archivo específico\nnpx playwright test tests/playground.spec.ts\n\n# Modo UI (recomendado para desarrollo)\nnpx playwright test --ui\n\n# Modo headed (ver el navegador)\nnpx playwright test --headed\n\n# Generar reporte HTML\nnpx playwright show-report",
      descEs: "¡Listo! Ejecuta tus tests contra el Playground. Usa --ui para ver el timeline interactivo o --headed para ver el navegador en acción.",
      descEn: "Ready! Run your tests against the Playground. Use --ui for the interactive timeline or --headed to see the browser in action.",
    },
  ];

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-3xl">
        <Link
          href={`/${lng}/playground`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {lng === "es" ? "Volver al Playground" : "Back to Playground"}
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          {lng === "es" ? "Guía de Configuración" : "Setup Guide"}
        </h1>
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          {lng === "es"
            ? "Sigue estos pasos para empezar a escribir tests de Playwright contra el PlayQ Playground."
            : "Follow these steps to start writing Playwright tests against the PlayQ Playground."}
        </p>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
              <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                {lng === "es" ? step.titleEs : step.titleEn}
              </h3>
              <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                {lng === "es" ? step.descEs : step.descEn}
              </p>
              <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 font-mono text-sm leading-relaxed text-[#c9d1d9]">
                <code>{step.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
