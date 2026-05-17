"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, FulfillmentMode } from "@/lib/catalog/types";
import { safeLocal } from "@/lib/safe-storage";

const STORAGE_KEY = "um-cart-v1";

interface CartState {
  lines: CartLine[];
  fulfillmentMode: FulfillmentMode;
  pickupSlotId: string | null;
  shippingZip: string | null;
  promoCode: string | null;
  addLine: (sku: string, quantity?: number) => void;
  setQuantity: (sku: string, quantity: number) => void;
  removeLine: (sku: string) => void;
  clear: () => void;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  setPickupSlotId: (id: string | null) => void;
  setShippingZip: (zip: string | null) => void;
  setPromoCode: (code: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      fulfillmentMode: "delivery",
      pickupSlotId: null,
      shippingZip: null,
      promoCode: null,
      addLine: (sku, quantity = 1) => {
        if (!sku || quantity <= 0) return;
        const existing = get().lines.find((l) => l.sku === sku);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.sku === sku
                ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
                : l
            ),
          });
        } else {
          set({
            lines: [...get().lines, { sku, quantity: Math.min(99, quantity) }],
          });
        }
      },
      setQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.sku !== sku) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.sku === sku ? { ...l, quantity: Math.min(99, quantity) } : l
          ),
        });
      },
      removeLine: (sku) => {
        set({ lines: get().lines.filter((l) => l.sku !== sku) });
      },
      clear: () => {
        set({
          lines: [],
          pickupSlotId: null,
          promoCode: null,
        });
      },
      setFulfillmentMode: (mode) => set({ fulfillmentMode: mode }),
      setPickupSlotId: (id) => set({ pickupSlotId: id }),
      setShippingZip: (zip) => set({ shippingZip: zip }),
      setPromoCode: (code) => set({ promoCode: code }),
    }),
    {
      name: STORAGE_KEY,
      // Use safeLocal instead of raw window.localStorage. FB/IG WebViews can
      // throw NotSupportedError or QuotaExceededError on setItem; the safe
      // wrapper catches, falls back to in-memory for the rest of the session,
      // and emits a cart_storage_unavailable diagnostic. Without this the
      // exception used to halt the entire Add-to-Cart click handler. (UNC-1121
      // follow-up after recurrence in Galileo briefing 2026-05-17.)
      storage: createJSONStorage(() => safeLocal as unknown as Storage),
      partialize: (state) => ({
        lines: state.lines,
        fulfillmentMode: state.fulfillmentMode,
        pickupSlotId: state.pickupSlotId,
        shippingZip: state.shippingZip,
        promoCode: state.promoCode,
      }),
      // Combine persisted state with any in-memory writes that happened before
      // rehydration finished. Default zustand-persist `merge` is a shallow
      // overwrite — persisted.lines would clobber pre-hydration adds.
      //
      // In FB/IG WebView the JS thread is heavily throttled and storage replay
      // can take seconds, during which users tap Add-to-Cart against an
      // ungated button (see AddToCartButton). Without this merge those clicks
      // are silently dropped when rehydration finally lands. (UNC-1121.)
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<CartState> | undefined) || {};
        const persistedLines = persisted.lines || [];
        const currentLines = currentState.lines || [];
        const byKey = new Map<string, CartLine>();
        for (const l of persistedLines) byKey.set(l.sku, { ...l });
        for (const l of currentLines) {
          const existing = byKey.get(l.sku);
          if (existing) {
            byKey.set(l.sku, {
              ...existing,
              quantity: Math.min(99, existing.quantity + l.quantity),
            });
          } else {
            byKey.set(l.sku, { ...l });
          }
        }
        return {
          ...currentState,
          ...persisted,
          lines: Array.from(byKey.values()),
        };
      },
    }
  )
);

// If rehydration hasn't fired within this window we treat the store as
// hydrated anyway. Real localStorage replays are sub-100ms on every browser
// we test; the long tail belongs to FB/IG WebView with throttled JS or
// restricted storage. Holding the cart drawer / qty stepper hostage past
// this threshold causes more harm (silent Add-to-Cart) than the brief
// risk of double-counting that the custom `merge` above already mitigates.
const HYDRATION_TIMEOUT_MS = 1500;

export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== "undefined" && useCartStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setHydrated(true);
    };
    const unsub = useCartStore.persist.onFinishHydration(finish);
    const t = window.setTimeout(finish, HYDRATION_TIMEOUT_MS);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);
  return hydrated;
}

export function useHydratedCart<T>(selector: (state: CartState) => T): T | null {
  const hydrated = useCartHydrated();
  const value = useCartStore(selector);
  return hydrated ? value : null;
}

export function useCartItemCount(): number {
  const lines = useCartStore((s) => s.lines);
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
