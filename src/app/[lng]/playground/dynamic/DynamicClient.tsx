"use client";

import { useState, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

export default function DynamicClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressDone, setProgressDone] = useState(false);
  const [randomReady, setRandomReady] = useState(false);
  const [disposing, setDisposing] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [toasts, setToasts] = useState<number[]>([]);

  // Section 1: Load after click
  function simulateLoad() { setLoading(true); setLoaded(false); setTimeout(() => { setLoading(false); setLoaded(true); }, 3000); }

  // Section 2: Progress bar
  function startProgress() {
    setProgress(0); setProgressDone(false);
    let p = 0; const iv = setInterval(() => { p += 10; setProgress(p); if (p >= 100) { clearInterval(iv); setProgressDone(true); } }, 500);
  }

  // Section 3: Random delay
  function randomLoad() { setRandomReady(false); const delay = 1000 + Math.random() * 4000; setTimeout(() => setRandomReady(true), delay); }

  // Section 4: Disabled input
  function enableInput() { setInputEnabled(false); setTimeout(() => setInputEnabled(true), 4000); }

  // Section 5: Disappearing element
  function showDisappearing() { setDisposing(true); setTimeout(() => setDisposing(false), 2000); }

  // Section 6: Toast
  function showToast() { const id = Date.now(); setToasts((t) => [...t, id]); setTimeout(() => setToasts((t) => t.filter((x) => x !== id)), 3000); }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-3xl">
        <ExerciseHeader
          title={lng === "es" ? "Contenido Dinámico" : "Dynamic Content"}
          description={lng === "es" ? "Practica el auto-waiting de Playwright con spinners, progress bars, delays aleatorios y elementos que desaparecen." : "Practice Playwright auto-waiting with spinners, progress bars, random delays, and disappearing elements."}
          linkedLessons={["M4: Auto-waiting"]}
          locatorStrategies={[
            lng === "es" ? "Playwright auto-espera a que los elementos estén visibles/habilitados. No necesitas waitForSelector." : "Playwright auto-waits for elements to be visible/enabled. You don't need waitForSelector.",
            lng === "es" ? "Usa expect(locator).toBeVisible({ timeout: 5000 }) para esperar que aparezca algo tras un delay." : "Use expect(locator).toBeVisible({ timeout: 5000 }) to wait for something to appear after a delay.",
            lng === "es" ? "Para elementos que desaparecen: expect(locator).not.toBeVisible()." : "For disappearing elements: expect(locator).not.toBeVisible().",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('esperar contenido tras el click', async ({ page }) => {\n  await page.goto('dynamic');\n  await page.getByRole('button', { name: 'Cargar Contenido' }).click();\n  // Playwright auto-espera a que aparezca el contenido\n  await expect(page.getByText('¡Contenido cargado exitosamente!')).toBeVisible({ timeout: 5000 });\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('wait for content after click', async ({ page }) => {\n  await page.goto('dynamic');\n  await page.getByRole('button', { name: 'Load Content' }).click();\n  // Playwright auto-waits for the content to appear\n  await expect(page.getByText('Content loaded successfully!')).toBeVisible({ timeout: 5000 });\n});`}
        />

        {/* Section 1: Loading */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "1. Carga tras click" : "1. Loading after click"}</h2>
          <button onClick={simulateLoad} disabled={loading} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500 disabled:opacity-50">
            {lng === "es" ? "Cargar Contenido" : "Load Content"}
          </button>
          {loading && <p className="mt-3 text-sm text-amber-400" role="status">⏳ {lng === "es" ? "Cargando..." : "Loading..."}</p>}
          {loaded && <p className="mt-3 text-sm text-brand-gold-400" role="status">{lng === "es" ? "✅ ¡Contenido cargado exitosamente!" : "✅ Content loaded successfully!"}</p>}
        </section>

        {/* Section 2: Progress bar */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "2. Barra de progreso" : "2. Progress bar"}</h2>
          <button onClick={startProgress} disabled={progress > 0 && progress < 100} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500 disabled:opacity-50">
            {lng === "es" ? "Iniciar Progreso" : "Start Progress"}
          </button>
          {progress > 0 && (
            <div className="mt-3">
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-brand-gold-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{progress}%</p>
            </div>
          )}
          {progressDone && (
            <button className="mt-3 rounded-lg bg-brand-gold-600 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={!progressDone}>
              {lng === "es" ? "✅ Continuar" : "✅ Continue"}
            </button>
          )}
        </section>

        {/* Section 3: Random delay */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "3. Delay aleatorio" : "3. Random delay"}</h2>
          <button onClick={randomLoad} disabled={!randomReady && randomReady === false ? undefined : undefined} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Añadir Elemento" : "Add Element"}
          </button>
          {randomReady && <p className="mt-3 text-sm text-brand-gold-400" role="status">{lng === "es" ? "🎲 ¡Elemento apareció!" : "🎲 Element appeared!"}</p>}
        </section>

        {/* Section 4: Disabled input */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "4. Input deshabilitado" : "4. Disabled input"}</h2>
          <button onClick={enableInput} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Habilitar en 4 segundos" : "Enable in 4 seconds"}
          </button>
          <input type="text" disabled={!inputEnabled} placeholder={inputEnabled ? (lng === "es" ? "¡Listo para escribir!" : "Ready to type!") : (lng === "es" ? "Esperando..." : "Waiting...")} className="mt-3 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm disabled:opacity-50" />
        </section>

        {/* Section 5: Disappearing */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "5. Elemento que desaparece" : "5. Disappearing element"}</h2>
          <button onClick={showDisappearing} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Mostrar por 2 segundos" : "Show for 2 seconds"}
          </button>
          {disposing && <p className="mt-3 text-sm text-amber-400 animate-fade-in-up" role="status">{lng === "es" ? "⏱️ Desapareceré pronto..." : "⏱️ I'll disappear soon..."}</p>}
        </section>

        {/* Section 6: Toasts */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "6. Notificaciones Toast" : "6. Toast notifications"}</h2>
          <button onClick={showToast} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Mostrar Toast" : "Show Toast"}
          </button>
        </section>

        {/* Toast container */}
        <div className="fixed bottom-4 right-4 z-40 space-y-2">
          {toasts.map((id) => (
            <div key={id} className="animate-fade-in-up rounded-lg border border-brand-gold-500/20 bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] shadow-lg" role="status">
              {lng === "es" ? "✅ Operación exitosa!" : "✅ Operation successful!"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
