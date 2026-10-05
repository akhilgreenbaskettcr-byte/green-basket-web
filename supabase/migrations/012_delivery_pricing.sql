-- ============================================================
-- GREEN BASKET — Location-based delivery pricing
--   * delivery_pricing_rules  : admin-managed pricing bands
--   * orders snapshot columns : distance, delivery area, rule used
--   * seed store/free-delivery settings (typed scalar keys)
-- ============================================================

create table if not exists public.delivery_pricing_rules (
  id                uuid primary key default uuid_generate_v4(),
  min_order         numeric(10,2) not null default 0 check (min_order >= 0),
  max_order         numeric(10,2) check (max_order is null or max_order > min_order),
  free_distance_km  numeric(6,2)  not null default 0 check (free_distance_km >= 0),
  base_charge       numeric(10,2) not null default 0 check (base_charge >= 0),
  per_km_charge     numeric(10,2) not null default 0 check (per_km_charge >= 0),
  extra_after_km    numeric(6,2)  not null default 0 check (extra_after_km >= 0),
  is_active         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Active order-value bands must never overlap
  constraint delivery_pricing_rules_no_overlap
    exclude using gist (numrange(min_order, max_order, '[]') with &&)
    where (is_active)
);

create index if not exists delivery_pricing_rules_min_order_idx
  on public.delivery_pricing_rules(min_order);

create trigger delivery_pricing_rules_updated_at
  before update on public.delivery_pricing_rules
  for each row execute function public.set_updated_at();

alter table public.delivery_pricing_rules enable row level security;

-- Rules are read server-side (service role) for pricing; only admins touch them via RLS.
create policy "delivery_pricing_rules: admin read"
  on public.delivery_pricing_rules for select using (public.is_admin());
create policy "delivery_pricing_rules: admin insert"
  on public.delivery_pricing_rules for insert with check (public.is_admin());
create policy "delivery_pricing_rules: admin update"
  on public.delivery_pricing_rules for update using (public.is_admin());
create policy "delivery_pricing_rules: admin delete"
  on public.delivery_pricing_rules for delete using (public.is_admin());

-- Default rules (only when the table is empty)
insert into public.delivery_pricing_rules
  (min_order, max_order, free_distance_km, base_charge, per_km_charge, extra_after_km, sort_order)
select * from (values
  (0::numeric,   199.99::numeric, 0::numeric, 30::numeric, 0::numeric, 0::numeric, 1),
  (200::numeric, 499.99::numeric, 3::numeric, 40::numeric, 6::numeric, 5::numeric, 2),
  (500::numeric, 1499.99::numeric, 5::numeric, 40::numeric, 6::numeric, 5::numeric, 3)
) as seed(min_order, max_order, free_distance_km, base_charge, per_km_charge, extra_after_km, sort_order)
where not exists (select 1 from public.delivery_pricing_rules);

-- Order snapshot columns
alter table public.orders
  add column if not exists delivery_distance_km numeric(6,2),
  add column if not exists delivery_area        text,
  add column if not exists delivery_rule_id     uuid references public.delivery_pricing_rules(id) on delete set null;

-- Typed scalar settings (keeps existing legacy keys untouched for rollback)
insert into public.site_settings (key, value) values
  ('free_delivery_enabled',   'true'),
  ('free_delivery_min_order', '1500'),
  ('store_lat',               ''),
  ('store_lng',               ''),
  ('store_location_label',    ''),
  ('store_location_link',     '')
on conflict (key) do nothing;
