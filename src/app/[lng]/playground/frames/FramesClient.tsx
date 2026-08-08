"use client";

import { useState, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

export default function FramesClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [showModal, setShowModal] = useState(false);
  const [frameMsg, setFrameMsg] = useState("");

  function openPopup() {
    const w = window.open("", "playq_popup", "width=400,height=500");
    if (w) {
      w.document.write(`
        <html><head><title>${lng === "es" ? "Ventana Emergente" : "Popup Window"}</title>
        <style>body{font-family:system-ui;max-width:320px;margin:16px auto;background:#1e1e2e;color:#cdd6f4;}
        input,button{padding:8px;margin:4px 0;width:100%;box-sizing:border-box;border-radius:6px;border:1px solid #45475a;background:#313244;color:#cdd6f4;}
        button{background:#2563eb;color:white;border:none;cursor:pointer;}</style></head>
        <body>
        <h3>${lng === "es" ? "Formulario en Popup" : "Popup Form"}</h3>
        <label for="popup-name">${lng === "es" ? "Nombre" : "Name"}</label>
        <input id="popup-name" type="text" />
        <label for="popup-email">Email</label>
        <input id="popup-email" type="email" />
        <button id="popup-submit" onclick="document.getElementById('popup-result').innerText='${lng === "es" ? "✅ Enviado desde popup!" : "✅ Submitted from popup!"}'">${lng === "es" ? "Enviar" : "Submit"}</button>
        <p id="popup-result" style="color:#10b981;margin-top:8px;"></p>
        </body></html>
      `);
      w.document.close();
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-2xl">
        <ExerciseHeader
          title={lng === "es" ? "iFrames y Popups" : "iFrames & Popups"}
          description={lng === "es" ? "Practica navegación entre frames, ventanas emergentes y modales. Usa page.frame(), page.waitForEvent('popup') y manejo de diálogos." : "Practice frame switching, popup windows, and modals. Use page.frame(), page.waitForEvent('popup'), and dialog handling."}
          linkedLessons={["M4: Frames & Windows"]}
          locatorStrategies={[
            lng === "es" ? "Para iframe: const frame = page.frameLocator('iframe'); await frame.getByLabel('Nombre').fill('test');" : "For iframe: const frame = page.frameLocator('iframe'); await frame.getByLabel('Name').fill('test');",
            lng === "es" ? "Para popup: const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('#open-popup')]); await popup.getByLabel('Nombre').fill('test');" : "For popup: const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('#open-popup')]); await popup.getByLabel('Name').fill('test');",
            lng === "es" ? "Para modales: usa page.getByRole('dialog') para localizar el modal." : "For modals: use page.getByRole('dialog') to locate the modal.",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('interactuar con el iframe', async ({ page }) => {\n  await page.goto('frames');\n  const iframe = page.frameLocator('iframe');\n  await iframe.getByLabel('Nombre').fill('Test User');\n  await iframe.getByRole('button', { name: 'Enviar' }).click();\n  await expect(iframe.getByText('Enviado')).toBeVisible();\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('interact with iframe', async ({ page }) => {\n  await page.goto('frames');\n  const iframe = page.frameLocator('iframe');\n  await iframe.getByLabel('Name').fill('Test User');\n  await iframe.getByRole('button', { name: 'Submit' }).click();\n  await expect(iframe.getByText('Submitted')).toBeVisible();\n});`}
        />

        {/* Nested iframe */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "iFrame con Formulario" : "iFrame with Form"}</h2>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">{lng === "es" ? "Interactúa con este formulario a través del iframe:" : "Interact with this form through the iframe:"}</p>
          <iframe
            srcDoc={`<html><body style="font-family:system-ui;background:#111827;color:#e5e7eb;padding:16px;">
            <label for="iframe-name" style="display:block;font-size:14px;margin-bottom:4px">${lng === "es" ? "Nombre" : "Name"}</label>
            <input id="iframe-name" type="text" style="padding:6px;border-radius:6px;border:1px solid #374151;background:#1f2937;color:#e5e7eb;width:100%;margin-bottom:8px" />
            <label for="iframe-email" style="display:block;font-size:14px;margin-bottom:4px">Email</label>
            <input id="iframe-email" type="email" style="padding:6px;border-radius:6px;border:1px solid #374151;background:#1f2937;color:#e5e7eb;width:100%;margin-bottom:8px" />
            <button onclick="document.getElementById('iframe-msg').innerText='${lng === "es" ? "✅ Enviado desde iframe!" : "✅ Submitted from iframe!"}'" style="padding:6px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer">${lng === "es" ? "Enviar" : "Submit"}</button>
            <p id="iframe-msg" style="color:#10b981;margin-top:8px;font-size:14px"></p>
            </body></html>`}
            title={lng === "es" ? "Formulario dentro de iframe" : "Form inside iframe"}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white/5"
            style={{ height: "280px" }}
          />
        </section>

        {/* Popup */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Ventana Emergente (Popup)" : "Popup Window"}</h2>
          <button onClick={openPopup} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Abrir Popup" : "Open Popup"}
          </button>
        </section>

        {/* Modal */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Modal con Formulario" : "Modal with Form"}</h2>
          <button onClick={() => setShowModal(true)} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
            {lng === "es" ? "Abrir Modal" : "Open Modal"}
          </button>
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={lng === "es" ? "Formulario en Modal" : "Modal Form"}>
              <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Formulario en Modal" : "Modal Form"}</h3>
              <label htmlFor="modal-name" className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">{lng === "es" ? "Nombre" : "Name"}</label>
              <input id="modal-name" type="text" className="mb-3 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm" />
              <label htmlFor="modal-email" className="block text-xs font-medium text-[var(--color-text-primary)] mb-1">Email</label>
              <input id="modal-email" type="email" className="mb-4 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm" />
              <button
                onClick={() => {
                  setFrameMsg(lng === "es" ? "✅ Enviado desde modal!" : "✅ Submitted from modal!");
                  setTimeout(() => setShowModal(false), 1000);
                }}
                className="w-full rounded-lg bg-brand-forest-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-forest-500"
              >
                {lng === "es" ? "Enviar" : "Submit"}
              </button>
              {frameMsg && <p className="mt-2 text-sm text-brand-gold-400">{frameMsg}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
