-- ============================================================
-- GREEN BASKET — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  role        text not null default 'customer' check (role in ('admin', 'customer')),
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_is_active_idx on public.categories(is_active);
create index if not exists categories_sort_order_idx on public.categories(sort_order);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid not null references public.categories(id) on delete restrict,
  name         text not null,
  slug         text not null unique,
  description  text,
  image_url    text,
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  benefits     text,
  ingredients  text,
  storage_info text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_is_active_idx on public.products(is_active);
create index if not exists products_is_featured_idx on public.products(is_featured);
create index if not exists products_sort_order_idx on public.products(sort_order);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
create table if not exists public.product_variants (
  id             uuid primary key default uuid_generate_v4(),
  product_id     uuid not null references public.products(id) on delete cascade,
  label          text not null,        -- e.g. "500g", "1kg", "500ml"
  price          numeric(10,2) not null check (price >= 0),
  compare_price  numeric(10,2) check (compare_price >= 0),
  sku            text unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_available   boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_sku_idx on public.product_variants(sku);
create index if not exists product_variants_is_available_idx on public.product_variants(is_available);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default uuid_generate_v4(),
  order_number    text not null unique,
  customer_id     uuid references public.profiles(id) on delete set null,
  status          text not null default 'pending' check (
                    status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
                  ),
  subtotal        numeric(10,2) not null check (subtotal >= 0),
  delivery_fee    numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total           numeric(10,2) not null check (total >= 0),
  customer_name   text not null,
  phone           text not null,
  email           text,
  address         text not null,
  city            text not null,
  pincode         text not null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id                     uuid primary key default uuid_generate_v4(),
  order_id               uuid not null references public.orders(id) on delete cascade,
  product_id             uuid references public.products(id) on delete set null,
  variant_id             uuid references public.product_variants(id) on delete set null,
  product_name_snapshot  text not null,
  variant_label_snapshot text not null,
  unit_price             numeric(10,2) not null check (unit_price >= 0),
  quantity               integer not null check (quantity > 0),
  line_total             numeric(10,2) not null check (line_total >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
create table if not exists public.site_settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       text,
  updated_at  timestamptz not null default now()
);

create index if not exists site_settings_key_idx on public.site_settings(key);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Order number generator
-- ============================================================
create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns text language plpgsql as $$
begin
  return 'GB-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
end;
$$;
