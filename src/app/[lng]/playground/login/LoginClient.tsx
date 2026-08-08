"use client";

import { useState, type FormEvent, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Valid credentials (displayed on page)                              */
/* ------------------------------------------------------------------ */

const VALID_USERS = {
  "student@playq.test": { password: "Playwright123!", role: "Student" },
  "admin@playq.test": { password: "Admin123!", role: "Admin" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LoginClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_submitted, setSubmitted] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loggedIn, setLoggedIn] = useState<{ email: string; role: string } | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = lng === "es" ? "El email es obligatorio" : "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = lng === "es" ? "Email inválido" : "Invalid email";
    if (!password) e.password = lng === "es" ? "La contraseña es obligatoria" : "Password is required";
    return e;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitted(true);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const user = VALID_USERS[email as keyof typeof VALID_USERS];
    if (!user || user.password !== password) {
      setErrors({ general: lng === "es" ? "Email o contraseña inválidos" : "Invalid email or password" });
      return;
    }
    setLoggedIn({ email, role: user.role });
  }

  if (loggedIn) {
    return (
      <div className="px-4 py-8">
        <div className="container-app max-w-lg">
          <div className="rounded-xl border border-brand-gold-500/20 bg-brand-gold-500/10 p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <h1 className="text-xl font-bold text-brand-gold-400" role="heading" aria-level={1}>
              {lng === "es" ? "¡Inicio de sesión exitoso!" : "Login Successful!"}
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              {lng === "es" ? "Bienvenido de nuevo" : "Welcome back"}, <strong>{loggedIn.email}</strong>
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]" role="status">
              {lng === "es" ? "Rol:" : "Role:"} {loggedIn.role}
            </p>
            <button
              type="button"
              onClick={() => { setLoggedIn(null); setEmail(""); setPassword(""); setSubmitted(false); setErrors({}); }}
              className="mt-4 text-sm text-brand-forest-400 hover:underline"
            >
              {lng === "es" ? "← Cerrar sesión" : "← Sign out"}
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
          title={lng === "es" ? "Formulario de Login" : "Login Form"}
          description={lng === "es"
            ? "Practica localizadores por rol (getByRole), etiqueta (getByLabel) y texto (getByText). Usa fill(), click() y aserciones de URL."
            : "Practice role-based (getByRole), label-based (getByLabel), and text-based (getByText) locators. Use fill(), click(), and URL assertions."}
          linkedLessons={["M3: Locators API", "M3: getByRole", "M4: Click & Fill", "M4: expect()"]}
          locatorStrategies={[
            lng === "es" ? "Usa page.getByLabel('Email') y page.getByLabel('Password') — los campos tienen etiquetas <label> asociadas." : "Use page.getByLabel('Email') and page.getByLabel('Password') — the fields have associated <label> elements.",
            lng === "es" ? "page.locator('form').getByRole('button', { name: 'Iniciar Sesión' }) — acota al formulario: el navbar tiene su propio botón 'Iniciar sesión' y sin acotar el localizador resuelve a 2 elementos (strict mode)." : "page.locator('form').getByRole('button', { name: 'Sign In' }) — scope to the form: the navbar has its own 'Sign in' button and without scoping the locator resolves to 2 elements (strict mode).",
            lng === "es" ? "page.getByRole('checkbox', { name: 'Recordarme' }) — para el checkbox." : "page.getByRole('checkbox', { name: 'Remember me' }) — for the checkbox.",
            lng === "es" ? "Verifica errores con page.getByText('El email es obligatorio') o page.getByRole('alert')." : "Verify errors with page.getByText('Email is required') or page.getByRole('alert').",
            lng === "es" ? "Tras login exitoso el mensaje aparece en la misma página (no navega): expect(page.getByRole('heading', { name: '¡Inicio de sesión exitoso!' })).toBeVisible()." : "After successful login the message appears on the same page (no navigation): expect(page.getByRole('heading', { name: 'Login Successful!' })).toBeVisible().",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('login con credenciales de estudiante', async ({ page }) => {\n  await page.goto('login');\n\n  // Rellena las credenciales usando las etiquetas\n  await page.getByLabel('Email').fill('student@playq.test');\n  await page.getByLabel('Password').fill('Playwright123!');\n\n  // Marca "Recordarme"\n  await page.getByRole('checkbox', { name: 'Recordarme' }).check();\n\n  // Envía (acotado al formulario: el navbar tiene otro botón "Iniciar sesión")\n  await page.locator('form').getByRole('button', { name: 'Iniciar Sesión' }).click();\n\n  // Verifica el éxito (la página no navega)\n  await expect(page.getByRole('heading', { name: '¡Inicio de sesión exitoso!' })).toBeVisible();\n  await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('login with student credentials', async ({ page }) => {\n  await page.goto('login');\n\n  // Fill credentials using labels\n  await page.getByLabel('Email').fill('student@playq.test');\n  await page.getByLabel('Password').fill('Playwright123!');\n\n  // Check remember me\n  await page.getByRole('checkbox', { name: 'Remember me' }).check();\n\n  // Submit (scoped to the form: the navbar has its own "Sign in" button)\n  await page.locator('form').getByRole('button', { name: 'Sign In' }).click();\n\n  // Assert success (the page does not navigate)\n  await expect(page.getByRole('heading', { name: 'Login Successful!' })).toBeVisible();\n  await expect(page.getByText('Welcome back')).toBeVisible();\n});`}
        />

        {/* Test credentials */}
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="mb-2 text-sm font-medium text-amber-400">{lng === "es" ? "Credenciales de Prueba" : "Test Credentials"}</p>
          <div className="space-y-1 text-xs text-[var(--color-text-secondary)] font-mono">
            <p>📧 student@playq.test / Playwright123! → {lng === "es" ? "Estudiante" : "Student"}</p>
            <p>📧 admin@playq.test / Admin123! → {lng === "es" ? "Admin" : "Admin"}</p>
          </div>
        </div>

        {/* Error banner */}
        {errors.general && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-[var(--color-text-primary)]">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-brand-forest-500 focus:outline-none focus:ring-1 focus:ring-brand-forest-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400" role="alert">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-text-primary)]">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-brand-forest-500 focus:outline-none focus:ring-1 focus:ring-brand-forest-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400" role="alert">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-brand-forest-600 focus:ring-brand-forest-500"
              />
              {lng === "es" ? "Recordarme" : "Remember me"}
            </label>
            <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-brand-forest-400 hover:underline">
              {lng === "es" ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-forest-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-forest-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-forest-500 focus:ring-offset-2"
          >
            {lng === "es" ? "Iniciar Sesión" : "Sign In"}
          </button>
        </form>

        {/* Forgot password modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowForgot(false)}>
            <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={lng === "es" ? "Recuperar contraseña" : "Reset password"} aria-modal="true">
              <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
                {lng === "es" ? "Recuperar Contraseña" : "Reset Password"}
              </h3>
              <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                {lng === "es" ? "Ingresa tu email y te enviaremos un enlace. (Esta es una simulación — no se enviará ningún email real.)" : "Enter your email and we'll send you a link. (This is a simulation — no real email will be sent.)"}
              </p>
              <input type="email" placeholder="you@example.com" className="mb-3 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm" />
              <button onClick={() => setShowForgot(false)} className="w-full rounded-lg bg-brand-forest-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-forest-500">
                {lng === "es" ? "Enviar Enlace" : "Send Link"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
