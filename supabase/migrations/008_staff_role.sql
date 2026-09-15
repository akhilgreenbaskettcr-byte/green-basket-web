-- ============================================================
-- Add 'staff' role to profiles table
-- ============================================================

-- Drop old check constraint and add new one including 'staff'
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'customer', 'staff'));
