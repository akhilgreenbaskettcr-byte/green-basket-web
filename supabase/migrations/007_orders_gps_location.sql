-- ============================================================
-- Add GPS coordinates to orders table
-- ============================================================
alter table public.orders
  add column if not exists gps_lat  double precision,
  add column if not exists gps_lng  double precision;

comment on column public.orders.gps_lat is 'Latitude captured from customer GPS at checkout (nullable)';
comment on column public.orders.gps_lng is 'Longitude captured from customer GPS at checkout (nullable)';
