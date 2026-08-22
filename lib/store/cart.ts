"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState, CartItem, AddToCartPayload } from "@/types/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: Omit<CartItem, "quantity">) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] });
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
