"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, FulfillmentMode } from "@/lib/catalog/types";

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        fulfillmentMode: state.fulfillmentMode,
        pickupSlotId: state.pickupSlotId,
        shippingZip: state.shippingZip,
        promoCode: state.promoCode,
      }),
    }
  )
);

export function useHydratedCart<T>(selector: (state: CartState) => T): T | null {
  const [hydrated, setHydrated] = useState(false);
  const value = useCartStore(selector);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated ? value : null;
}

export function useCartItemCount(): number {
  const lines = useCartStore((s) => s.lines);
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
