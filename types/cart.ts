import type { ProductVariant } from "@/types/database";

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  slug: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export type AddToCartPayload = {
  productId: string;
  productName: string;
  slug: string;
  imageUrl: string | null;
  variant: ProductVariant;
};
