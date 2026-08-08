"use client";

import { useState, type FormEvent, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  name: string;
  email: string;
  dob: string;
  username: string;
  password: string;
  confirm: string;
  newsletter: boolean;
  country: string;
  notifications: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const STEPS = ["Personal", "Account", "Preferences", "Review"];

export default function SignUpClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<FormData>({
    name: "", email: "", dob: "", username: "", password: "", confirm: "",
    newsletter: false, country: "", notifications: "email",
  });

  function update(field: keyof FormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    const req = lng === "es" ? "Este campo es obligatorio" : "This field is required";
    if (step === 0) {
      if (!data.name.trim()) e.name = req;
      if (!data.email.trim()) e.email = req;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = lng === "es" ? "Email inválido" : "Invalid email";
    } else if (step === 1) {
      if (!data.username.trim()) e.username = req;
      if (data.username.length < 4) e.username = lng === "es" ? "Mínimo 4 caracteres" : "Minimum 4 characters";
      if (!data.password) e.password = req;
      else if (data.password.length < 8) e.password = lng === "es" ? "Mínimo 8 caracteres" : "Minimum 8 characters";
      if (data.password !== data.confirm) e.confirm = lng === "es" ? "Las contraseñas no coinciden" : "Passwords do not match";
    } else if (step === 2) {
      if (!data.country) e.country = req;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (step === 3) setSubmitted(true);
    else next();
  }

  if (submitted) {
    return (
      <div className="px-4 py-8">
        <div className="container-app max-w-lg">
          <div className="rounded-xl border border-brand-gold-500/20 bg-brand-gold-500/10 p-6">
            <h2 className="text-xl font-bold text-brand-gold-400">{lng === "es" ? "¡Registro exitoso!" : "Registration Successful!"}</h2>
            <div className="mt-4 space-y-1 text-sm text-[var(--color-text-secondary)]">
              <p><strong>{lng === "es" ? "Nombre:" : "Name:"}</strong> {data.name}</p>
              <p><strong>Email:</strong> {data.email}</p>
              <p><strong>{lng === "es" ? "Usuario:" : "Username:"}</strong> {data.username}</p>
              <p><strong>{lng === "es" ? "País:" : "Country:"}</strong> {data.country}</p>
              <p><strong>{lng === "es" ? "Newsletter:" : "Newsletter:"}</strong> {data.newsletter ? "✅" : "❌"}</p>
            </div>
            <button onClick={() => { setSubmitted(false); setStep(0); }} className="mt-4 text-sm text-brand-forest-400 hover:underline">
              {lng === "es" ? "← Nuevo registro" : "← New registration"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-lg">
        <ExerciseHeader
          title={lng === "es" ? "Asistente de Registro" : "Sign Up Wizard"}
          description={lng === "es" ? "Formulario multi-paso con validación por etapa. Practica navegación condicional, selectores anidados y verificación de estado entre pasos." : "Multi-step form with per-stage validation. Practice conditional navigation, nested selectors, and cross-step state verification."}
          linkedLessons={["M3: Locators", "M4: Actions", "M4: Assertions"]}
          locatorStrategies={[
            lng === "es" ? "Usa page.getByRole('button', { name: 'Siguiente' }) y page.getByRole('button', { name: 'Atrás' }) para navegación." : "Use page.getByRole('button', { name: 'Next' }) and page.getByRole('button', { name: 'Back' }) for navigation.",
            lng === "es" ? "Verifica que los mensajes de error aparecen con page.getByText('Este campo es obligatorio')." : "Verify error messages appear with page.getByText('This field is required').",
            lng === "es" ? "Después del registro, verifica el resumen con page.getByText('¡Registro exitoso!') y los datos mostrados." : "After registration, verify the summary with page.getByText('Registration Successful') and the displayed data.",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('avanzar el asistente de registro', async ({ page }) => {\n  await page.goto('signup');\n  await page.getByLabel('Nombre Completo').fill('Jane Doe');\n  await page.getByLabel('Email').fill('jane@test.com');\n  await page.getByRole('button', { name: 'Siguiente' }).click();\n  // El paso 2 (Cuenta) ya es visible\n  await expect(page.getByLabel('Nombre de Usuario')).toBeVisible();\n  // Continúa con el resto de pasos...\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('advance the sign up wizard', async ({ page }) => {\n  await page.goto('signup');\n  await page.getByLabel('Full Name').fill('Jane Doe');\n  await page.getByLabel('Email').fill('jane@test.com');\n  await page.getByRole('button', { name: 'Next' }).click();\n  // Step 2 (Account) is now visible\n  await expect(page.getByLabel('Username')).toBeVisible();\n  // Continue through the remaining steps...\n});`}
        />

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className={["flex-1 h-1.5 rounded-full transition-colors", i <= step ? "bg-brand-forest-500" : "bg-[var(--color-bg-elevated)]"].join(" ")} />
          ))}
        </div>
        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
          {lng === "es" ? "Paso" : "Step"} {step + 1}/4: {STEPS[step]}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Step 0: Personal */}
          {step === 0 && (
            <>
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "Nombre Completo" : "Full Name"}</label>
                <input id="signup-name" type="text" value={data.name} onChange={(e) => update("name", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
                {errors.name && <p className="mt-1 text-xs text-red-400" role="alert">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-[var(--color-text-primary)]">Email</label>
                <input id="signup-email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
                {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="signup-dob" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "Fecha de Nacimiento" : "Date of Birth"}</label>
                <input id="signup-dob" type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)]" />
              </div>
            </>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <div>
                <label htmlFor="signup-username" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "Nombre de Usuario" : "Username"}</label>
                <input id="signup-username" type="text" value={data.username} onChange={(e) => update("username", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
                {errors.username && <p className="mt-1 text-xs text-red-400" role="alert">{errors.username}</p>}
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "Contraseña" : "Password"}</label>
                <input id="signup-password" type="password" value={data.password} onChange={(e) => update("password", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
                {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "Confirmar Contraseña" : "Confirm Password"}</label>
                <input id="signup-confirm" type="password" value={data.confirm} onChange={(e) => update("confirm", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
                {errors.confirm && <p className="mt-1 text-xs text-red-400" role="alert">{errors.confirm}</p>}
              </div>
            </>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <>
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                <input type="checkbox" checked={data.newsletter} onChange={(e) => update("newsletter", e.target.checked)} className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-brand-forest-600" />
                {lng === "es" ? "Suscribirme al newsletter" : "Subscribe to newsletter"}
              </label>
              <div>
                <label htmlFor="signup-country" className="block text-sm font-medium text-[var(--color-text-primary)]">{lng === "es" ? "País" : "Country"}</label>
                <select id="signup-country" value={data.country} onChange={(e) => update("country", e.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm">
                  <option value="">{lng === "es" ? "Seleccionar..." : "Select..."}</option>
                  <option value="ES">🇪🇸 {lng === "es" ? "España" : "Spain"}</option>
                  <option value="US">🇺🇸 {lng === "es" ? "Estados Unidos" : "United States"}</option>
                  <option value="MX">🇲🇽 México</option>
                  <option value="AR">🇦🇷 Argentina</option>
                  <option value="CO">🇨🇴 Colombia</option>
                </select>
                {errors.country && <p className="mt-1 text-xs text-red-400" role="alert">{errors.country}</p>}
              </div>
              <fieldset>
                <legend className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">{lng === "es" ? "Notificaciones" : "Notifications"}</legend>
                {["email", "push", "none"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1 cursor-pointer">
                    <input type="radio" name="notifications" value={opt} checked={data.notifications === opt} onChange={(e) => update("notifications", e.target.value)} className="text-brand-forest-600" />
                    {opt === "email" ? (lng === "es" ? "Email" : "Email") : opt === "push" ? (lng === "es" ? "Push" : "Push") : (lng === "es" ? "Ninguna" : "None")}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-2 rounded-lg bg-[var(--color-bg-elevated)] p-4 text-sm text-[var(--color-text-secondary)]">
              <p><strong>{lng === "es" ? "Nombre:" : "Name:"}</strong> {data.name}</p>
              <p><strong>Email:</strong> {data.email}</p>
              <p><strong>{lng === "es" ? "Usuario:" : "Username:"}</strong> {data.username}</p>
              <p><strong>{lng === "es" ? "País:" : "Country:"}</strong> {data.country || "—"}</p>
              <p><strong>{lng === "es" ? "Newsletter:" : "Newsletter:"}</strong> {data.newsletter ? "✅" : "❌"}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step > 0 && (
              <button type="button" onClick={prev} className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]">
                {lng === "es" ? "← Atrás" : "← Back"}
              </button>
            )}
            <button type="submit" className="flex-1 rounded-lg bg-brand-forest-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-forest-500">
              {step === 3 ? (lng === "es" ? "Registrarse" : "Sign Up") : (lng === "es" ? "Siguiente →" : "Next →")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
