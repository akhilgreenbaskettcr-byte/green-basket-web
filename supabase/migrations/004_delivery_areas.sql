-- ============================================================
-- GREEN BASKET — Delivery Areas Table & RLS
-- ============================================================

create table if not exists public.delivery_areas (
  id          uuid primary key default uuid_generate_v4(),
  pincode     text not null check (pincode ~ '^\d{6}$'),
  area_name   text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint delivery_areas_pincode_area_name_key unique (pincode, area_name)
);

create index if not exists delivery_areas_pincode_idx on public.delivery_areas(pincode);
create index if not exists delivery_areas_is_active_idx on public.delivery_areas(is_active);

-- Updated at trigger
create trigger delivery_areas_updated_at
  before update on public.delivery_areas
  for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.delivery_areas enable row level security;

-- RLS Policies
-- Public can read active delivery areas
create policy "delivery_areas: public read active"
  on public.delivery_areas for select
  using (is_active = true);

-- Admins can read all delivery areas
create policy "delivery_areas: admin read all"
  on public.delivery_areas for select
  using (public.is_admin());

-- Admins can insert delivery areas
create policy "delivery_areas: admin insert"
  on public.delivery_areas for insert
  with check (public.is_admin());

-- Admins can update delivery areas
create policy "delivery_areas: admin update"
  on public.delivery_areas for update
  using (public.is_admin());

-- Admins can delete delivery areas
create policy "delivery_areas: admin delete"
  on public.delivery_areas for delete
  using (public.is_admin());
