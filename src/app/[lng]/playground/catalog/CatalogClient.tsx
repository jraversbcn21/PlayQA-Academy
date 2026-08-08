"use client";

import { useState, useMemo, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Product data                                                       */
/* ------------------------------------------------------------------ */

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Test Automation Guide", category: "Books", price: 29.99, rating: 4, image: "📘" },
  { id: 2, name: "CI/CD Pipeline Tool", category: "Software", price: 49.99, rating: 5, image: "🔧" },
  { id: 3, name: "Debugging Headphones", category: "Hardware", price: 79.99, rating: 3, image: "🎧" },
  { id: 4, name: "QA Best Practices eBook", category: "Books", price: 14.99, rating: 4, image: "📖" },
  { id: 5, name: "Playwright Poster", category: "Merch", price: 9.99, rating: 5, image: "🖼️" },
  { id: 6, name: "Test Data Generator", category: "Software", price: 39.99, rating: 4, image: "⚙️" },
  { id: 7, name: "Ergonomic Keyboard", category: "Hardware", price: 119.99, rating: 4, image: "⌨️" },
  { id: 8, name: "Bug Tracker Notebook", category: "Merch", price: 7.99, rating: 3, image: "📓" },
  { id: 9, name: "Selenium to Playwright Guide", category: "Books", price: 24.99, rating: 5, image: "🔄" },
  { id: 10, name: "Load Testing Suite", category: "Software", price: 89.99, rating: 4, image: "📊" },
  { id: 11, name: "Noise-Cancelling Mic", category: "Hardware", price: 59.99, rating: 4, image: "🎤" },
  { id: 12, name: "QA Team Mug", category: "Merch", price: 12.99, rating: 5, image: "☕" },
];

const CATEGORIES = ["Books", "Software", "Hardware", "Merch"];
const ITEMS_PER_PAGE = 6;

export default function CatalogClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(120);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<string>("name");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<Product[]>([]);

  const filtered = useMemo(() => {
    let items = PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCats.size > 0 && !selectedCats.has(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      return true;
    });
    items.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        default: return a.name.localeCompare(b.name);
      }
    });
    return items;
  }, [search, selectedCats, maxPrice, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function toggleCat(cat: string) {
    setSelectedCats((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }
  function addToCart(p: Product) {
    setCart((prev) => [...prev, p]);
  }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-6xl">
        <ExerciseHeader
          title={lng === "es" ? "Catálogo E-commerce" : "E-commerce Catalog"}
          description={lng === "es" ? "Filtros combinados, ordenamiento y paginación. Practica localizadores complejos en un grid de productos." : "Combined filters, sorting and pagination. Practice complex locators in a product grid."}
          linkedLessons={["M3: Locators", "M5: POM"]}
          locatorStrategies={[
            lng === "es" ? "Usa page.getByRole('checkbox', { name: 'Books' }) para filtros de categoría." : "Use page.getByRole('checkbox', { name: 'Books' }) for category filters.",
            lng === "es" ? "page.getByRole('combobox', { name: 'Sort by' }) para el dropdown de ordenamiento." : "page.getByRole('combobox', { name: 'Sort by' }) for the sort dropdown.",
            lng === "es" ? "page.getByRole('button', { name: 'Agregar al Carrito' }).first() para el primer producto." : "page.getByRole('button', { name: 'Add to Cart' }).first() for the first product.",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('filtrar y ordenar productos', async ({ page }) => {\n  await page.goto('catalog');\n  await page.getByRole('checkbox', { name: 'Books' }).check();\n  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price_asc');\n  // El catálogo tiene 3 productos en la categoría Books\n  await expect(page.getByRole('article')).toHaveCount(3);\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('filter and sort products', async ({ page }) => {\n  await page.goto('catalog');\n  await page.getByRole('checkbox', { name: 'Books' }).check();\n  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('price_asc');\n  // The catalog has 3 products in the Books category\n  await expect(page.getByRole('article')).toHaveCount(3);\n});`}
        />

        {/* Cart counter */}
        <div className="mb-4 text-right">
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand-terra-500/10 px-3 py-1 text-sm text-brand-terra-400" role="status" aria-label={`${cart.length} items in cart`}>
            🛒 {cart.length} {lng === "es" ? "en carrito" : "in cart"}
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter sidebar */}
          <aside className="w-full lg:w-56 shrink-0 space-y-5">
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={lng === "es" ? "Buscar productos..." : "Search products..."}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
              aria-label={lng === "es" ? "Buscar productos" : "Search products"}
            />
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">{lng === "es" ? "Categoría" : "Category"}</legend>
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-1 cursor-pointer">
                  <input type="checkbox" checked={selectedCats.has(cat)} onChange={() => toggleCat(cat)} className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-brand-forest-600" />
                  {cat}
                </label>
              ))}
            </fieldset>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">{lng === "es" ? "Precio máximo" : "Max Price"}: ${maxPrice}</label>
              <input type="range" min={5} max={120} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">{lng === "es" ? "Rating mínimo" : "Min Rating"}: {"★".repeat(minRating)}{"☆".repeat(5 - minRating)}</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((r) => (
                  <button key={r} type="button" onClick={() => setMinRating(r === minRating ? 0 : r)} className={["text-sm", r <= minRating ? "text-amber-400" : "text-[var(--color-text-muted)]"].join(" ")}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-muted)]">{filtered.length} {lng === "es" ? "productos" : "products"}</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-sm"
                aria-label="Sort by"
              >
                <option value="name">{lng === "es" ? "Nombre" : "Name"}</option>
                <option value="price_asc">{lng === "es" ? "Precio: menor a mayor" : "Price: Low to High"}</option>
                <option value="price_desc">{lng === "es" ? "Precio: mayor a menor" : "Price: High to Low"}</option>
                <option value="rating">{lng === "es" ? "Rating" : "Rating"}</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map((p) => (
                <article key={p.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4" role="article" aria-label={p.name}>
                  <div className="mb-3 text-center text-5xl">{p.image}</div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">{p.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.category}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-gold-400">${p.price}</span>
                    <span className="text-amber-400">{"★".repeat(p.rating)}{"☆".repeat(5 - p.rating)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    className="mt-3 w-full rounded-lg bg-brand-terra-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-terra-400"
                  >
                    {lng === "es" ? "Agregar al Carrito" : "Add to Cart"}
                  </button>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-6 flex items-center justify-center gap-1" aria-label={lng === "es" ? "Paginación" : "Pagination"}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50">←</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={["rounded-lg border px-3 py-1 text-sm", i + 1 === currentPage ? "border-brand-forest-500 bg-brand-forest-500/20 text-brand-forest-400" : "border-[var(--color-border)] text-[var(--color-text-muted)]"].join(" ")}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50">→</button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
