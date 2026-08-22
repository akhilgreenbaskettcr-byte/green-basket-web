export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "customer";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "customer";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: "admin" | "customer";
          phone?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          benefits: string | null;
          ingredients: string | null;
          storage_info: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          benefits?: string | null;
          ingredients?: string | null;
          storage_info?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          benefits?: string | null;
          ingredients?: string | null;
          storage_info?: string | null;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          price: number;
          compare_price: number | null;
          sku: string | null;
          stock_quantity: number;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          price: number;
          compare_price?: number | null;
          sku?: string | null;
          stock_quantity?: number;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          price?: number;
          compare_price?: number | null;
          sku?: string | null;
          stock_quantity?: number;
          is_available?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          status:
            | "pending"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          subtotal: number;
          delivery_fee: number;
          total: number;
          customer_name: string;
          phone: string;
          email: string | null;
          address: string;
          city: string;
          pincode: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          status?:
            | "pending"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          subtotal: number;
          delivery_fee?: number;
          total: number;
          customer_name: string;
          phone: string;
          email?: string | null;
          address: string;
          city: string;
          pincode: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?:
            | "pending"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name_snapshot: string;
          variant_label_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_label_snapshot: string;
          unit_price: number;
          quantity: number;
          line_total: number;
        };
        Update: never;
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          value?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

// ============================================================
// Convenience types
// ============================================================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];

export type OrderStatus = Order["status"];

// Enriched product type with variants and category
export type ProductWithVariants = Product & {
  product_variants: ProductVariant[];
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

// Enriched order type with items
export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

// Site settings as a flat map
export type SiteSettings = Record<string, string>;
