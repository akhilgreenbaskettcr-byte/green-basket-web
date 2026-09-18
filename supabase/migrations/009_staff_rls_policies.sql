-- ============================================================
-- 009_staff_rls_policies.sql
-- Grant 'staff' role permissions to view and update orders,
-- order items, products, categories, and delivery areas
-- ============================================================

-- 1. Helper function to check if current user is admin OR staff
create or replace function public.is_admin_or_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- 2. ORDERS: Allow admin and staff to view all orders and update status
drop policy if exists "orders: admin view all" on public.orders;
create policy "orders: admin view all"
  on public.orders for select
  using (public.is_admin_or_staff());

drop policy if exists "orders: admin update" on public.orders;
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin_or_staff());

-- 3. ORDER ITEMS: Allow admin and staff to view order items
drop policy if exists "order_items: admin view all" on public.order_items;
create policy "order_items: admin view all"
  on public.order_items for select
  using (public.is_admin_or_staff());

-- 4. PRODUCTS: Allow admin and staff to view, insert, update, and delete products
drop policy if exists "products: admin read all" on public.products;
create policy "products: admin read all"
  on public.products for select
  using (public.is_admin_or_staff());

drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin_or_staff());

drop policy if exists "products: admin update" on public.products;
create policy "products: admin update"
  on public.products for update
  using (public.is_admin_or_staff());

drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin_or_staff());

-- 5. PRODUCT VARIANTS: Allow admin and staff to manage variants
drop policy if exists "variants: admin read all" on public.product_variants;
create policy "variants: admin read all"
  on public.product_variants for select
  using (public.is_admin_or_staff());

drop policy if exists "variants: admin insert" on public.product_variants;
create policy "variants: admin insert"
  on public.product_variants for insert
  with check (public.is_admin_or_staff());

drop policy if exists "variants: admin update" on public.product_variants;
create policy "variants: admin update"
  on public.product_variants for update
  using (public.is_admin_or_staff());

drop policy if exists "variants: admin delete" on public.product_variants;
create policy "variants: admin delete"
  on public.product_variants for delete
  using (public.is_admin_or_staff());

-- 6. CATEGORIES: Allow admin and staff to manage categories
drop policy if exists "categories: admin read all" on public.categories;
create policy "categories: admin read all"
  on public.categories for select
  using (public.is_admin_or_staff());

drop policy if exists "categories: admin insert" on public.categories;
create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin_or_staff());

drop policy if exists "categories: admin update" on public.categories;
create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin_or_staff());

drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin_or_staff());

-- 7. DELIVERY AREAS: Allow admin and staff to manage delivery areas
drop policy if exists "delivery_areas: admin read all" on public.delivery_areas;
create policy "delivery_areas: admin read all"
  on public.delivery_areas for select
  using (public.is_admin_or_staff());

drop policy if exists "delivery_areas: admin insert" on public.delivery_areas;
create policy "delivery_areas: admin insert"
  on public.delivery_areas for insert
  with check (public.is_admin_or_staff());

drop policy if exists "delivery_areas: admin update" on public.delivery_areas;
create policy "delivery_areas: admin update"
  on public.delivery_areas for update
  using (public.is_admin_or_staff());

drop policy if exists "delivery_areas: admin delete" on public.delivery_areas;
create policy "delivery_areas: admin delete"
  on public.delivery_areas for delete
  using (public.is_admin_or_staff());
