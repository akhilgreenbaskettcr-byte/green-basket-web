-- ============================================================
-- GREEN BASKET — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_settings enable row level security;

-- ============================================================
-- HELPER: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES policies
-- ============================================================
-- Users can view their own profile
create policy "profiles: user can view own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (not role)
create policy "profiles: user can update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'customer');

-- Admins can view all profiles
create policy "profiles: admin can view all"
  on public.profiles for select
  using (public.is_admin());

-- Admins can update all profiles
create policy "profiles: admin can update all"
  on public.profiles for update
  using (public.is_admin());

-- System can insert (via trigger)
create policy "profiles: allow insert via trigger"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- CATEGORIES policies
-- ============================================================
-- Public can read active categories
create policy "categories: public read active"
  on public.categories for select
  using (is_active = true);

-- Admins can read all
create policy "categories: admin read all"
  on public.categories for select
  using (public.is_admin());

-- Admins can insert
create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());

-- Admins can update
create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin());

-- Admins can delete
create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

-- ============================================================
-- PRODUCTS policies
-- ============================================================
-- Public can read active products
create policy "products: public read active"
  on public.products for select
  using (is_active = true);

-- Admins can read all
create policy "products: admin read all"
  on public.products for select
  using (public.is_admin());

-- Admins can insert
create policy "products: admin insert"
  on public.products for insert
  with check (public.is_admin());

-- Admins can update
create policy "products: admin update"
  on public.products for update
  using (public.is_admin());

-- Admins can delete
create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

-- ============================================================
-- PRODUCT VARIANTS policies
-- ============================================================
-- Public can read available variants for active products
create policy "variants: public read available"
  on public.product_variants for select
  using (
    is_available = true
    and exists (
      select 1 from public.products
      where id = product_variants.product_id and is_active = true
    )
  );

-- Admins can read all
create policy "variants: admin read all"
  on public.product_variants for select
  using (public.is_admin());

-- Admins can insert
create policy "variants: admin insert"
  on public.product_variants for insert
  with check (public.is_admin());

-- Admins can update
create policy "variants: admin update"
  on public.product_variants for update
  using (public.is_admin());

-- Admins can delete
create policy "variants: admin delete"
  on public.product_variants for delete
  using (public.is_admin());

-- ============================================================
-- ORDERS policies
-- ============================================================
-- Customers can view their own orders
create policy "orders: customer view own"
  on public.orders for select
  using (auth.uid() = customer_id);

-- Admins can view all orders
create policy "orders: admin view all"
  on public.orders for select
  using (public.is_admin());

-- Anyone (including anonymous) can insert an order
-- (guest checkout support)
create policy "orders: anyone can insert"
  on public.orders for insert
  with check (true);

-- Admins can update order status
create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin());

-- ============================================================
-- ORDER ITEMS policies
-- ============================================================
-- Customers can view items from their own orders
create policy "order_items: customer view own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id and customer_id = auth.uid()
    )
  );

-- Admins can view all
create policy "order_items: admin view all"
  on public.order_items for select
  using (public.is_admin());

-- Anyone can insert (during order creation)
create policy "order_items: anyone can insert"
  on public.order_items for insert
  with check (true);

-- ============================================================
-- SITE SETTINGS policies
-- ============================================================
-- Public can read all settings
create policy "site_settings: public read"
  on public.site_settings for select
  using (true);

-- Admins can insert/update/delete
create policy "site_settings: admin write"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "site_settings: admin update"
  on public.site_settings for update
  using (public.is_admin());

create policy "site_settings: admin delete"
  on public.site_settings for delete
  using (public.is_admin());
