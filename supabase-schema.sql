-- Safe Auto-House initial Supabase schema
-- Run this inside Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'driver');
create type public.driver_status as enum ('active', 'frozen', 'fired');
create type public.vehicle_kind as enum ('fuel', 'electric', 'hybrid', 'gas');
create type public.post_audience as enum ('home', 'personal');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  email text not null,
  tax_number text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  email text not null default '',
  age integer,
  plate text not null default '',
  status public.driver_status not null default 'active',
  vehicle_type public.vehicle_kind not null default 'fuel',
  photo_url text,
  identity_number text not null default '',
  license_number text not null default '',
  special_license text not null default '',
  tax_number text not null default '',
  freenow_email text not null default '',
  bolt_email text not null default '',
  uber_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  admin_tax_number text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.driver_settings (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  rent_per_day numeric(10,2) not null default 0,
  insurance_per_day numeric(10,2) not null default 0,
  tolls_per_day numeric(10,2) not null default 0,
  vat_percent numeric(6,2) not null default 24,
  app_tax_percent numeric(6,2) not null default 12,
  electric_price_per_km numeric(10,4) not null default 0,
  updated_at timestamptz not null default now()
);

create table public.driver_days (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  work_date date not null,
  week_start date not null,
  freenow numeric(10,2) not null default 0,
  bolt numeric(10,2) not null default 0,
  uber numeric(10,2) not null default 0,
  street numeric(10,2) not null default 0,
  z_report numeric(10,2) not null default 0,
  fuel_cost numeric(10,2) not null default 0,
  electric_km numeric(10,2) not null default 0,
  saved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (driver_id, work_date)
);

create table public.official_driver_weeks (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  week_start date not null,
  app_turnover numeric(10,2) not null default 0,
  card_payments numeric(10,2) not null default 0,
  freenow_card numeric(10,2) not null default 0,
  freenow_cash numeric(10,2) not null default 0,
  uber_card numeric(10,2) not null default 0,
  uber_cash numeric(10,2) not null default 0,
  bolt_card numeric(10,2) not null default 0,
  bolt_cash numeric(10,2) not null default 0,
  worked_days numeric(6,2) not null default 0,
  vat numeric(10,2) not null default 0,
  saved_at timestamptz not null default now(),
  unique (driver_id, week_start)
);

create table public.weekly_app_profits (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  freenow numeric(10,2) not null default 0,
  bolt numeric(10,2) not null default 0,
  uber numeric(10,2) not null default 0,
  saved_at timestamptz,
  unique (admin_id, week_start)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete cascade,
  audience public.post_audience not null default 'home',
  message text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.sales_installments (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  plate text not null,
  price numeric(10,2) not null default 0,
  vehicle_type text not null default '',
  total_price numeric(10,2) not null default 0,
  monthly_price numeric(10,2) not null default 0,
  total_installments integer not null default 0,
  paid_installments integer not null default 0,
  last_paid_month text not null default '',
  taxi_license_monthly_installment numeric(10,2) not null default 0,
  owner_name text not null default '',
  car_model text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.registration_requests enable row level security;
alter table public.driver_settings enable row level security;
alter table public.driver_days enable row level security;
alter table public.official_driver_weeks enable row level security;
alter table public.weekly_app_profits enable row level security;
alter table public.announcements enable row level security;
alter table public.sales_installments enable row level security;

create policy "profiles can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "admins can read their drivers"
on public.drivers for select
using (admin_id = auth.uid() or user_id = auth.uid());

create policy "admins manage their drivers"
on public.drivers for all
using (admin_id = auth.uid())
with check (admin_id = auth.uid());

create policy "drivers read own settings"
on public.driver_settings for select
using (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_settings.driver_id
      and (drivers.user_id = auth.uid() or drivers.admin_id = auth.uid())
  )
);

create policy "admins manage driver settings"
on public.driver_settings for all
using (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_settings.driver_id
      and drivers.admin_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_settings.driver_id
      and drivers.admin_id = auth.uid()
  )
);

create policy "drivers and admins read driver days"
on public.driver_days for select
using (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_days.driver_id
      and (drivers.user_id = auth.uid() or drivers.admin_id = auth.uid())
  )
);

create policy "drivers insert own driver days"
on public.driver_days for insert
with check (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_days.driver_id
      and drivers.user_id = auth.uid()
  )
);

create policy "drivers update own driver days"
on public.driver_days for update
using (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_days.driver_id
      and drivers.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.drivers
    where drivers.id = driver_days.driver_id
      and drivers.user_id = auth.uid()
  )
);

create policy "admins manage official weeks"
on public.official_driver_weeks for all
using (
  exists (
    select 1 from public.drivers
    where drivers.id = official_driver_weeks.driver_id
      and drivers.admin_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.drivers
    where drivers.id = official_driver_weeks.driver_id
      and drivers.admin_id = auth.uid()
  )
);

create policy "drivers read own official weeks"
on public.official_driver_weeks for select
using (
  exists (
    select 1 from public.drivers
    where drivers.id = official_driver_weeks.driver_id
      and drivers.user_id = auth.uid()
  )
);

create policy "admins manage weekly app profits"
on public.weekly_app_profits for all
using (admin_id = auth.uid())
with check (admin_id = auth.uid());

create policy "admins manage announcements"
on public.announcements for all
using (admin_id = auth.uid())
with check (admin_id = auth.uid());

create policy "drivers read relevant announcements"
on public.announcements for select
using (
  audience = 'home'
  or exists (
    select 1 from public.drivers
    where drivers.id = announcements.driver_id
      and drivers.user_id = auth.uid()
  )
);

create policy "admins manage sales installments"
on public.sales_installments for all
using (admin_id = auth.uid())
with check (admin_id = auth.uid());
