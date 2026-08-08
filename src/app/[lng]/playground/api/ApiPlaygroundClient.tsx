"use client";

import { useState, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Endpoint documentation                                             */
/* ------------------------------------------------------------------ */

interface EndpointDoc {
  method: string;
  path: string;
  descEs: string;
  descEn: string;
  body?: string;
  response: string;
}

const ENDPOINTS: EndpointDoc[] = [
  { method: "GET", path: "/api/playground/users", descEs: "Obtener todos los usuarios", descEn: "Get all users", response: `{ "success": true, "data": [{ "id": 1, "name": "Alice", "email": "alice@example.com", "role": "QA Engineer" }], "count": 3 }` },
  { method: "GET", path: "/api/playground/users/1", descEs: "Obtener usuario por ID", descEn: "Get user by ID", response: `{ "success": true, "data": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "QA Engineer" } }` },
  { method: "POST", path: "/api/playground/users", descEs: "Crear un nuevo usuario", descEn: "Create a new user", body: `{ "name": "New User", "email": "new@example.com", "role": "QA Engineer" }`, response: `{ "success": true, "data": { "id": 4, "name": "New User", "email": "new@example.com", "role": "QA Engineer" } }` },
  { method: "PUT", path: "/api/playground/users/1", descEs: "Actualizar usuario existente", descEn: "Update existing user", body: `{ "name": "Updated Name", "role": "Senior QA" }`, response: `{ "success": true, "data": { "id": 1, "name": "Updated Name", "email": "alice@example.com", "role": "Senior QA" } }` },
  { method: "DELETE", path: "/api/playground/users/1", descEs: "Eliminar un usuario", descEn: "Delete a user", response: `{ "success": true, "message": "User deleted" }` },
  { method: "GET", path: "/api/playground/products", descEs: "Obtener todos los productos", descEn: "Get all products", response: `{ "success": true, "data": [{ "id": 1, "name": "Test Automation Guide", "price": 29.99 }], "count": 6 }` },
  { method: "POST", path: "/api/playground/auth/login", descEs: "Login y obtener token", descEn: "Login and get token", body: `{ "email": "student@playq.test", "password": "Playwright123!" }`, response: `{ "success": true, "data": { "token": "playq_mock_jwt_student_abc123", "user": { "email": "student@playq.test", "role": "student" } } }` },
  { method: "GET", path: "/api/playground/protected", descEs: "Endpoint protegido (requiere token)", descEn: "Protected endpoint (requires token)", response: `{ "success": true, "data": { "message": "You have accessed a protected endpoint" } }` },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApiPlaygroundClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [expanded, setExpanded] = useState<number | null>(null);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.playqacademy.com";
  const apiBase = `${baseUrl}/api/playground`;

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-3xl">
        <ExerciseHeader
          title={lng === "es" ? "API Playground" : "API Playground"}
          description={lng === "es" ? "Endpoints REST reales para practicar API testing con Playwright. Todos los endpoints responden con JSON y códigos de estado HTTP apropiados." : "Real REST endpoints to practice API testing with Playwright. All endpoints respond with JSON and appropriate HTTP status codes."}
          linkedLessons={["M7: API Testing", "M7: APIRequestContext"]}
          locatorStrategies={[
            lng === "es" ? "Usa request.get() y request.post() de Playwright para tests de API." : "Use Playwright's request.get() and request.post() for API tests.",
            lng === "es" ? "Verifica status codes con expect(response.status()).toBe(200)." : "Verify status codes with expect(response.status()).toBe(200).",
            lng === "es" ? "Para endpoints protegidos, pasa el header Authorization: Bearer <token>." : "For protected endpoints, pass the Authorization: Bearer <token> header.",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\nconst BASE = '${apiBase}';\n\ntest('login y acceso a endpoint protegido', async ({ request }) => {\n  // Login\n  const loginRes = await request.post(BASE + '/auth/login', {\n    data: { email: 'student@playq.test', password: 'Playwright123!' }\n  });\n  expect(loginRes.status()).toBe(200);\n  const { data } = await loginRes.json();\n\n  // Acceso al endpoint protegido\n  const protectedRes = await request.get(BASE + '/protected', {\n    headers: { Authorization: \`Bearer \${data.token}\` }\n  });\n  expect(protectedRes.status()).toBe(200);\n});`
            : `import { test, expect } from '@playwright/test';\n\nconst BASE = '${apiBase}';\n\ntest('login and access protected endpoint', async ({ request }) => {\n  // Login\n  const loginRes = await request.post(BASE + '/auth/login', {\n    data: { email: 'student@playq.test', password: 'Playwright123!' }\n  });\n  expect(loginRes.status()).toBe(200);\n  const { data } = await loginRes.json();\n\n  // Access protected\n  const protectedRes = await request.get(BASE + '/protected', {\n    headers: { Authorization: \`Bearer \${data.token}\` }\n  });\n  expect(protectedRes.status()).toBe(200);\n});`}
        />

        <div className="space-y-4">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 p-4 text-left hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                <span className={["rounded px-2 py-0.5 font-mono text-xs font-bold", ep.method === "GET" ? "bg-brand-gold-500/20 text-brand-gold-400" : ep.method === "POST" ? "bg-brand-forest-500/20 text-brand-forest-400" : ep.method === "PUT" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"].join(" ")}>
                  {ep.method}
                </span>
                <code className="break-all font-mono text-sm text-[var(--color-text-primary)]">{ep.path}</code>
                {/* full-width line below on mobile; inline right-aligned from sm up */}
                <span className="w-full text-xs text-[var(--color-text-muted)] sm:ml-auto sm:w-auto sm:text-right">{lng === "es" ? ep.descEs : ep.descEn}</span>
              </button>
              {expanded === i && (
                <div className="border-t border-[var(--color-border)] p-4 space-y-4">
                  <p className="text-sm text-[var(--color-text-secondary)]">{lng === "es" ? ep.descEs : ep.descEn}</p>

                  {ep.body && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">{lng === "es" ? "Body de la petición:" : "Request body:"}</p>
                      <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-xs text-[#c9d1d9]"><code>{ep.body}</code></pre>
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">{lng === "es" ? "Respuesta:" : "Response:"}</p>
                    <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-xs text-brand-gold-400"><code>{ep.response}</code></pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
