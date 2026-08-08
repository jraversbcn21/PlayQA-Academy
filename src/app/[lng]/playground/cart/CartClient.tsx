"use client";

import { useState, use } from "react";
import { useTranslation } from "@/lib/i18n/client";
import ExerciseHeader from "@/components/playground/ExerciseHeader";

/* ------------------------------------------------------------------ */
/*  Cart item type                                                     */
/* ------------------------------------------------------------------ */

interface CartItem {
  product: string;
  price: number;
  quantity: number;
}

const INITIAL_ITEMS: CartItem[] = [
  { product: "Test Automation Guide", price: 29.99, quantity: 1 },
  { product: "Playwright Poster", price: 9.99, quantity: 2 },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CartClient(props: { params: Promise<{ lng: string }> }) {
  const params = use(props.params);

  const {
    lng
  } = params;

  const { t: _t } = useTranslation("common");
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  function updateQty(idx: number, delta: number) {
    setItems((prev) => {
      const n = [...prev];
      if (n[idx] && n[idx]!.quantity + delta >= 1) n[idx] = { ...n[idx]!, quantity: n[idx]!.quantity + delta };
      return n;
    });
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  function applyCoupon() {
    if (coupon === "PLAYQ10") {
      setCouponApplied(true);
      setCouponError("");
      setCoupon("");
    } else {
      setCouponError(lng === "es" ? "Cupón inválido. Prueba: PLAYQ10" : "Invalid coupon. Try: PLAYQ10");
      setCouponApplied(false);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="container-app max-w-2xl">
        <ExerciseHeader
          title={lng === "es" ? "Carrito de Compras" : "Shopping Cart"}
          description={lng === "es" ? "Manejo de cantidades, totales dinámicos, cupones de descuento y estado vacío." : "Quantity management, dynamic totals, discount coupons, and empty state."}
          linkedLessons={["M4: Actions", "M4: Assertions"]}
          locatorStrategies={[
            lng === "es" ? "page.getByRole('spinbutton') para campos numéricos de cantidad." : "page.getByRole('spinbutton') for quantity number inputs.",
            lng === "es" ? "Verifica totales con page.getByTestId('cart-total')." : "Verify totals with page.getByTestId('cart-total').",
            lng === "es" ? "page.getByRole('button', { name: 'Eliminar' }) para eliminar items (el nombre accesible incluye el producto)." : "page.getByRole('button', { name: 'Remove' }) to remove items (the accessible name includes the product).",
          ]}
          testTemplate={lng === "es"
            ? `import { test, expect } from '@playwright/test';\n\ntest('el cupón reduce el total', async ({ page }) => {\n  await page.goto('cart');\n  // Total inicial: $29.99 + 2×$9.99 + 8% de impuesto\n  await expect(page.getByTestId('cart-total')).toHaveText('$53.97');\n  await page.getByPlaceholder('Código de cupón').fill('PLAYQ10');\n  await page.getByRole('button', { name: 'Aplicar' }).click();\n  // Con el 10% de descuento aplicado\n  await expect(page.getByTestId('cart-total')).toHaveText('$48.57');\n});`
            : `import { test, expect } from '@playwright/test';\n\ntest('apply coupon reduces total', async ({ page }) => {\n  await page.goto('cart');\n  // Initial total: $29.99 + 2×$9.99 + 8% tax\n  await expect(page.getByTestId('cart-total')).toHaveText('$53.97');\n  await page.getByPlaceholder('Enter coupon code').fill('PLAYQ10');\n  await page.getByRole('button', { name: 'Apply' }).click();\n  // With the 10% discount applied\n  await expect(page.getByTestId('cart-total')).toHaveText('$48.57');\n});`}
        />

        {items.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-12 text-center" role="status">
            <p className="text-3xl mb-2">🛒</p>
            <p className="text-sm text-[var(--color-text-muted)]">{lng === "es" ? "Tu carrito está vacío" : "Your cart is empty"}</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-3 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.product}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(idx, -1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg-elevated)]" aria-label={lng === "es" ? "Reducir cantidad" : "Decrease quantity"}>−</button>
                    <input type="number" value={item.quantity} readOnly className="w-10 text-center text-sm bg-transparent tabular-nums" role="spinbutton" aria-label={lng === "es" ? `Cantidad de ${item.product}` : `Quantity of ${item.product}`} />
                    <button type="button" onClick={() => updateQty(idx, 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg-elevated)]" aria-label={lng === "es" ? "Aumentar cantidad" : "Increase quantity"}>+</button>
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} className="rounded p-1 text-xs text-red-400 hover:bg-red-500/10" aria-label={lng === "es" ? `Eliminar ${item.product}` : `Remove ${item.product}`}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                placeholder={lng === "es" ? "Código de cupón" : "Enter coupon code"}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
              />
              <button type="button" onClick={applyCoupon} className="rounded-lg bg-brand-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-500">
                {lng === "es" ? "Aplicar" : "Apply"}
              </button>
            </div>
            {couponError && <p className="mb-4 text-xs text-red-400" role="alert">{couponError}</p>}
            {couponApplied && <p className="mb-4 text-xs text-brand-gold-400">✓ PLAYQ10: {lng === "es" ? "10% de descuento aplicado" : "10% off applied"}</p>}

            {/* Totals */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--color-text-secondary)]"><span>{lng === "es" ? "Subtotal" : "Subtotal"}</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-brand-gold-400"><span>{lng === "es" ? "Descuento (10%)" : "Discount (10%)"}</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-[var(--color-text-secondary)]"><span>{lng === "es" ? "Impuesto (8%)" : "Tax (8%)"}</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold text-[var(--color-text-primary)]">
                <span>{lng === "es" ? "Total" : "Total"}</span>
                <span data-testid="cart-total">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="button" className="flex-1 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]">
                {lng === "es" ? "Seguir Comprando" : "Continue Shopping"}
              </button>
              <button type="button" className="flex-1 rounded-lg bg-brand-terra-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-terra-400">
                {lng === "es" ? "Pagar" : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
