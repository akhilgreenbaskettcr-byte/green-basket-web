-- ============================================================
-- GREEN BASKET — Enforce Category & Product Visibility RLS
-- ============================================================

-- Drop old product public read policy
drop policy if exists "products: public read active" on public.products;

-- Create updated policy: Product must be active AND its category must be active
create policy "products: public read active"
  on public.products for select
  using (
    is_active = true
    and exists (
      select 1 from public.categories
      where id = products.category_id and is_active = true
    )
  );

-- Drop old variant public read policy
drop policy if exists "variants: public read available" on public.product_variants;

-- Create updated policy: Variant available, product active AND category active
create policy "variants: public read available"
  on public.product_variants for select
  using (
    is_available = true
    and exists (
      select 1 from public.products p
      join public.categories c on c.id = p.category_id
      where p.id = product_variants.product_id
        and p.is_active = true
        and c.is_active = true
    )
  );
