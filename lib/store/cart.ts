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

      addItem: (newItem: Omit<CartItem, "quantity">) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        const itemRecord: CartItem = { ...newItem, quantity: 1 };

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
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
  });
}
