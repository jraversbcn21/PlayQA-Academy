"use client";

import { useState, useRef, type DragEvent, type ChangeEvent, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

export default function FilesClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [uploaded, setUploaded] = useState<{ name: string; size: number; preview: string | null } | null>(null);
  const [multiFiles, setMultiFiles] = useState<{ name: string; size: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function validateFile(file: File): boolean {
    if (!file.type.startsWith("image/")) {
      setError(lng === "es" ? "Solo se aceptan imágenes (PNG, JPG, GIF)." : "Only images accepted (PNG, JPG, GIF).");
      return false;
    }
    setError("");
    return true;
  }

  function handleSingleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    const reader = new FileReader();
    reader.onload = () => setUploaded({ name: file.name, size: file.size, preview: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file && validateFile(file)) { const r = new FileReader(); r.onload = () => setUploaded({ name: file.name, size: file.size, preview: r.result as string }); r.readAsDataURL(file); } }
  function handleMulti(e: ChangeEvent<HTMLInputElement>) { setMultiFiles(Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size }))); }

  function triggerDownload(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-2xl">
        <ExerciseHeader
          title={lng === "es" ? "Subida y Descarga de Archivos" : "File Upload & Download"}
          description={lng === "es" ? "Practica file input, drag-and-drop, validación de tipos y descargas de archivos." : "Practice file input, drag-and-drop, type validation, and file downloads."}
          linkedLessons={["M4: Special Actions"]}
          locatorStrategies={[
            lng === "es" ? "page.getByLabel('Seleccionar archivo') o page.locator('input[type=file]') para el input de archivo." : "page.getByLabel('Choose file') or page.locator('input[type=file]') for file input.",
            lng === "es" ? "Usa page.locator('input[type=file]').setInputFiles('path/to/file.png') en Playwright." : "Use page.locator('input[type=file]').setInputFiles('path/to/file.png') in Playwright.",
            lng === "es" ? "Para descargas: const download = await page.waitForEvent('download'); await page.getByRole('button', { name: 'Descargar CSV' }).click();" : "For downloads: const download = await page.waitForEvent('download'); await page.getByRole('button', { name: 'Download CSV' }).click();",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('subir y verificar archivo', async ({ page }) => {\n  await page.goto('files');\n  // Un PNG de 1×1 generado en memoria — no necesitas ningún archivo en disco\n  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';\n  await page.locator('input[type=file]').first().setInputFiles({\n    name: 'test-image.png',\n    mimeType: 'image/png',\n    buffer: Buffer.from(png, 'base64'),\n  });\n  await expect(page.getByText('Archivo subido')).toBeVisible();\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('upload and verify file', async ({ page }) => {\n  await page.goto('files');\n  // A 1×1 PNG generated in memory — no file on disk needed\n  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';\n  await page.locator('input[type=file]').first().setInputFiles({\n    name: 'test-image.png',\n    mimeType: 'image/png',\n    buffer: Buffer.from(png, 'base64'),\n  });\n  await expect(page.getByText('File uploaded')).toBeVisible();\n});`}
        />

        {/* Single file upload */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Subida Simple (solo imágenes)" : "Single Upload (images only)"}</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={["rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer", dragOver ? "border-brand-forest-500 bg-brand-forest-500/5" : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"].join(" ")}
            onClick={() => fileInput.current?.click()}
            role="button"
            tabIndex={0}
            aria-label={lng === "es" ? "Subir archivo" : "Upload file"}
          >
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm text-[var(--color-text-muted)]">{lng === "es" ? "Arrastra una imagen o haz clic para seleccionar" : "Drag an image or click to select"}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">PNG, JPG, GIF</p>
          </div>
          <input ref={fileInput} type="file" accept="image/*" onChange={handleSingleFile} className="hidden" aria-label={lng === "es" ? "Seleccionar archivo" : "Choose file"} />
          {error && <p className="mt-2 text-xs text-red-400" role="alert">{error}</p>}
          {uploaded && (
            <div className="mt-3 rounded-lg bg-[var(--color-bg-elevated)] p-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: object URL preview, next/image doesn't support blob sources */}
              {uploaded.preview && <img src={uploaded.preview} alt={uploaded.name} className="h-12 w-12 rounded object-cover" />}
              <div><p className="text-sm font-medium text-[var(--color-text-primary)]">✅ {lng === "es" ? "Archivo subido" : "File uploaded"}</p><p className="text-xs text-[var(--color-text-muted)]">{uploaded.name} ({(uploaded.size / 1024).toFixed(1)} KB)</p></div>
            </div>
          )}
        </section>

        {/* Multi file upload */}
        <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Subida Múltiple" : "Multiple Upload"}</h2>
          <label className="inline-block rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500 cursor-pointer">
            {lng === "es" ? "Seleccionar Archivos" : "Select Files"}
            <input type="file" multiple onChange={handleMulti} className="hidden" />
          </label>
          {multiFiles.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-[var(--color-text-secondary)]">
              {multiFiles.map((f, i) => <li key={i}>📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)</li>)}
            </ul>
          )}
        </section>

        {/* Downloads */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">{lng === "es" ? "Descargas" : "Downloads"}</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => triggerDownload("sample.csv", "id,name,email\n1,Alice,alice@test.com\n2,Bob,bob@test.com", "text/csv")} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm text-white hover:bg-brand-forest-500">
              📥 {lng === "es" ? "Descargar CSV" : "Download CSV"}
            </button>
            <button onClick={() => triggerDownload("report.pdf", "%PDF-1.4 mock report content", "application/pdf")} className="rounded-lg bg-brand-terra-500 px-4 py-2 text-sm text-white hover:bg-brand-terra-400">
              📄 {lng === "es" ? "Generar Reporte PDF" : "Generate PDF Report"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
