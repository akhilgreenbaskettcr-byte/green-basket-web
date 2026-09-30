"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState, CartItem, AddToCartPayload } from "@/types/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedItem: null,

      addItem: (newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        const amountToAdd = Math.max(1, qty);
        const itemRecord: CartItem = { ...newItem, quantity: amountToAdd };

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + amountToAdd }
                : i
            ),
            isOpen: true,
            lastAddedItem: itemRecord,
          });
        } else {
          set({
            items: [...items, itemRecord],
            isOpen: true,
            lastAddedItem: itemRecord,
          });
        }
      },

      // Like addItem but does NOT open the cart drawer or show toast — used by Buy Now
      addItemSilent: (newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        const amountToAdd = Math.max(1, qty);
        const itemRecord: CartItem = { ...newItem, quantity: amountToAdd };

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + amountToAdd }
                : i
            ),
            lastAddedItem: null,
            // isOpen intentionally NOT set — cart drawer stays closed
          });
        } else {
          set({
            items: [...items, itemRecord],
            lastAddedItem: null,
            // isOpen intentionally NOT set — cart drawer stays closed
          });
        }
      },

      removeItem: (variantId: string) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearLastAdded: () => set({ lastAddedItem: null }),

      itemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      gstTotal: () => {
        const items = get().items;
        const total = items.reduce((sum, item) => {
          if (item.gstEnabled && item.gstPercentage && item.gstPercentage > 0) {
            const itemTotal = item.price * item.quantity;
            return sum + (itemTotal * item.gstPercentage) / 100;
          }
          return sum;
        }, 0);
        return Math.round((total + Number.EPSILON) * 100) / 100;
      },

      gstBreakdown: () => {
        const items = get().items;
        const breakdownMap = new Map<number, { taxableAmount: number; gstAmount: number }>();

        for (const item of items) {
          if (item.gstEnabled && item.gstPercentage && item.gstPercentage > 0) {
            const rate = Number(item.gstPercentage);
            const lineTotal = item.price * item.quantity;
            const lineGst = (lineTotal * rate) / 100;

            const existing = breakdownMap.get(rate) || { taxableAmount: 0, gstAmount: 0 };
            breakdownMap.set(rate, {
              taxableAmount: existing.taxableAmount + lineTotal,
              gstAmount: existing.gstAmount + lineGst,
            });
          }
        }

        return Array.from(breakdownMap.entries())
          .map(([percentage, { taxableAmount, gstAmount }]) => ({
            percentage,
            taxableAmount: Math.round((taxableAmount + Number.EPSILON) * 100) / 100,
            gstAmount: Math.round((gstAmount + Number.EPSILON) * 100) / 100,
          }))
          .sort((a, b) => a.percentage - b.percentage);
      },
    }),
    {
      name: "green-basket-cart",
      partialize: (state) => ({ items: state.items }), // Only persist items array to localStorage
    }
  )
);

export function addToCart(payload: AddToCartPayload) {
  const { addItem } = useCartStore.getState();
  addItem({
    productId: payload.productId,
    variantId: payload.variant.id,
    productName: payload.productName,
    variantLabel: payload.variant.label,
    price: payload.variant.price,
    imageUrl: payload.imageUrl,
    slug: payload.slug,
    categoryId: payload.categoryId,
    gstEnabled: payload.gstEnabled,
    gstPercentage: payload.gstPercentage,
  });
}
