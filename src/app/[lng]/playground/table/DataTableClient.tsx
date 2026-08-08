"use client";

import { useState, useMemo, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Employee data                                                      */
/* ------------------------------------------------------------------ */

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: number;
  status: string;
}

const EMPLOYEES: Employee[] = Array.from({ length: 50 }, (_, i) => {
  const depts = ["Engineering", "QA", "Product", "Design", "DevOps"];
  const pos = ["Junior", "Mid", "Senior", "Lead", "Principal"];
  const statuses = ["Active", "On Leave", "Remote"];
  return {
    id: 1001 + i,
    name: ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hank", "Iris", "Jack"][i % 10] + " " + ["Johnson", "Smith", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson"][Math.floor(i / 5) % 10],
    department: depts[i % depts.length]!,
    position: pos[i % pos.length]!,
    salary: 45000 + Math.floor(i * 1730) + (i % 5) * 2500,
    status: statuses[i % statuses.length]!,
  };
});

const PAGE_SIZES = [10, 25, 50];
const DEPTS = [...new Set(EMPLOYEES.map((e) => e.department))];

export default function DataTableClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [sortCol, setSortCol] = useState<string>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [data, setData] = useState(EMPLOYEES);

  const filtered = useMemo(() => {
    return data.filter((e) => {
      if (filters.name && !e.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.department && e.department !== filters.department) return false;
      if (filters.status && e.status !== filters.status) return false;
      return true;
    }).sort((a, b) => {
      const aVal = a[sortCol as keyof Employee];
      const bVal = b[sortCol as keyof Employee];
      if (typeof aVal === "string") return sortDir === "asc" ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [data, filters, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }
  function toggleSelect(id: number) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((e) => e.id)));
  }
  function saveEdit(id: number) {
    setData((prev) => prev.map((e) => e.id === id ? { ...e, name: editValue } : e));
    setEditing(null);
  }

  const cols = [
    { key: "id", labelEs: "ID", labelEn: "ID" },
    { key: "name", labelEs: "Nombre", labelEn: "Name" },
    { key: "department", labelEs: "Departamento", labelEn: "Department" },
    { key: "position", labelEs: "Cargo", labelEn: "Position" },
    { key: "salary", labelEs: "Salario", labelEn: "Salary" },
    { key: "status", labelEs: "Estado", labelEn: "Status" },
  ];

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-6xl">
        <ExerciseHeader
          title={lng === "es" ? "Tabla de Datos" : "Data Table"}
          description={lng === "es" ? "Tabla con ordenamiento, filtros, paginación, selección múltiple y edición inline. Practica localizadores de tabla." : "Table with sorting, filtering, pagination, multi-select, and inline editing. Practice table locators."}
          linkedLessons={["M3: Locators", "M4: Actions"]}
          locatorStrategies={[
            lng === "es" ? "page.getByRole('columnheader', { name: 'Nombre' }) para encabezados de columna." : "page.getByRole('columnheader', { name: 'Name' }) for column headers.",
            lng === "es" ? "page.getByRole('row', { name: /Alice/ }) para filas específicas." : "page.getByRole('row', { name: /Alice/ }) for specific rows.",
            lng === "es" ? "page.getByRole('checkbox', { name: 'Seleccionar todo' }) para selección masiva." : "page.getByRole('checkbox', { name: 'Select all' }) for bulk selection.",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('ordenar y filtrar la tabla', async ({ page }) => {\n  await page.goto('table');\n  await page.getByRole('columnheader', { name: 'Nombre' }).click();\n  // nth(0) = encabezados, nth(1) = fila de filtros, nth(2) = primera fila de datos\n  const firstDataRow = page.getByRole('row').nth(2);\n  await expect(firstDataRow).toContainText('Alice');\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('sort and filter table', async ({ page }) => {\n  await page.goto('table');\n  await page.getByRole('columnheader', { name: 'Name' }).click();\n  // nth(0) = headers, nth(1) = filter row, nth(2) = first data row\n  const firstDataRow = page.getByRole('row').nth(2);\n  await expect(firstDataRow).toContainText('Alice');\n});`}
        />

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-sm" aria-label="Rows per page">
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} {lng === "es" ? "por página" : "per page"}</option>)}
          </select>
          {selected.size > 0 && (
            <select className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-sm" aria-label="Bulk action">
              <option>{lng === "es" ? "Acción Masiva" : "Bulk Action"}</option>
              <option>{lng === "es" ? "Eliminar Seleccionados" : "Delete Selected"}</option>
              <option>{lng === "es" ? "Exportar CSV" : "Export CSV"}</option>
            </select>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm" role="table">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <tr role="row">
                <th className="p-3 w-10"><input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} aria-label={lng === "es" ? "Seleccionar todo" : "Select all"} className="h-4 w-4 rounded" /></th>
                {cols.map((col) => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} className="p-3 text-left text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-primary)] select-none" role="columnheader" aria-label={lng === "es" ? col.labelEs : col.labelEn}>
                    {lng === "es" ? col.labelEs : col.labelEn} {sortCol === col.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
              {/* Filter row */}
              <tr>
                <th className="p-1" />
                {cols.map((col) => (
                  <th key={col.key} className="p-1">
                    {["name", "department", "status"].includes(col.key) ? (
                      col.key === "department" ? (
                        <select value={filters[col.key] ?? ""} onChange={(e) => { setFilters((f) => ({ ...f, [col.key]: e.target.value })); setPage(1); }} className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-xs" aria-label={`Filter ${col.key}`}>
                          <option value="">{lng === "es" ? "Todos" : "All"}</option>
                          {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      ) : (
                        <input type="text" value={filters[col.key] ?? ""} onChange={(e) => { setFilters((f) => ({ ...f, [col.key]: e.target.value })); setPage(1); }} placeholder={lng === "es" ? "Filtrar..." : "Filter..."} className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-xs" />
                      )
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((emp) => (
                <tr key={emp.id} className={["border-b border-[var(--color-border)]", selected.has(emp.id) ? "bg-brand-forest-500/10" : "hover:bg-[var(--color-bg-elevated)]"].join(" ")} role="row">
                  <td className="p-3"><input type="checkbox" checked={selected.has(emp.id)} onChange={() => toggleSelect(emp.id)} className="h-4 w-4 rounded" aria-label={`Select ${emp.name}`} /></td>
                  <td className="p-3 text-xs tabular-nums">{emp.id}</td>
                  <td className="p-3" onClick={() => { if (editing === null) { setEditing(emp.id); setEditValue(emp.name); } }}>
                    {editing === emp.id ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit(emp.id)} onKeyDown={(e) => e.key === "Enter" && saveEdit(emp.id)} className="w-full rounded border border-brand-forest-500 bg-[var(--color-bg-secondary)] px-2 py-1 text-xs" autoFocus />
                    ) : (
                      <span className="text-[var(--color-text-primary)]">{emp.name}</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-[var(--color-text-secondary)]">{emp.department}</td>
                  <td className="p-3 text-xs text-[var(--color-text-secondary)]">{emp.position}</td>
                  <td className="p-3 text-xs tabular-nums text-brand-gold-400">${emp.salary.toLocaleString()}</td>
                  <td className="p-3 text-xs"><span className={["inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", emp.status === "Active" ? "bg-brand-gold-500/10 text-brand-gold-400" : emp.status === "Remote" ? "bg-brand-forest-500/10 text-brand-forest-400" : "bg-amber-500/10 text-amber-400"].join(" ")}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>{filtered.length} {lng === "es" ? "resultados" : "results"}</span>
          <nav className="flex items-center gap-1" aria-label={lng === "es" ? "Paginación" : "Pagination"}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-50">←</button>
            <span className="px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded border border-[var(--color-border)] px-2 py-1 disabled:opacity-50">→</button>
          </nav>
        </div>
      </div>
    </div>
  );
}
