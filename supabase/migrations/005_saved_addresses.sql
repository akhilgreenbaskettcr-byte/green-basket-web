-- ============================================================
-- GREEN BASKET — Saved Addresses Table & RLS
-- ============================================================

create table if not exists public.addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  full_name    text not null,
  phone        text not null,
  address_line text not null,
  city         text not null,
  pincode      text not null check (pincode ~ '^\d{6}$'),
  label        text not null default 'Home',
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- Updated at trigger
create trigger addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.addresses enable row level security;

-- RLS Policies
-- Users can view their own saved addresses
create policy "addresses: user view own"
  on public.addresses for select
  using (auth.uid() = user_id);

-- Users can insert their own saved addresses
create policy "addresses: user insert own"
  on public.addresses for insert
  with check (auth.uid() = user_id);

-- Users can update their own saved addresses
create policy "addresses: user update own"
  on public.addresses for update
  using (auth.uid() = user_id);

-- Users can delete their own saved addresses
create policy "addresses: user delete own"
  on public.addresses for delete
  using (auth.uid() = user_id);
