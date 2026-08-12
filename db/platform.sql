-- Marbella Boat Charter Platform
-- PostgreSQL / Supabase-oriented foundation.
-- Apply through reviewed migrations. Do not execute blindly against production.

create extension if not exists pgcrypto;

create type public.lead_status as enum ('new','qualified','quoted','won','lost','archived');
create type public.booking_status as enum ('enquiry','option','deposit_due','confirmed','preparing','boarded','completed','cancelled','no_show');
create type public.payment_status as enum ('not_due','due','partial','paid','refunded','failed');
create type public.vessel_status as enum ('active','paused','maintenance','private_only','archived');
create type public.maintenance_status as enum ('planned','scheduled','in_progress','blocked','completed','cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin','sales','operations','content','owner','crew')),
  phone text,
  locale text not null default 'en' check (locale in ('en','es','fr')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text,
  phone text,
  locale text default 'en',
  country_code text,
  marketing_consent boolean not null default false,
  internal_notes text,
  first_enquiry_at timestamptz,
  last_enquiry_at timestamptz,
  completed_charters integer not null default 0,
  cancelled_charters integer not null default 0,
  no_shows integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists clients_email_unique on public.clients(lower(email)) where email is not null;
create index if not exists clients_phone_idx on public.clients(phone);

create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_name text not null,
  email text,
  phone text,
  billing_details jsonb not null default '{}'::jsonb,
  commission_terms jsonb not null default '{}'::jsonb,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('motor','sailing','fishing','group')),
  owner_id uuid references public.owners(id) on delete set null,
  status public.vessel_status not null default 'active',
  loa_m numeric(6,2),
  beam_m numeric(6,2),
  max_day_guests integer not null check (max_day_guests > 0),
  sleeping_guests integer,
  cabins integer,
  base_port text,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  toys jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vessels_category_status_idx on public.vessels(category,status);

create table if not exists public.vessel_media (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  kind text not null check (kind in ('image','video','floorplan','document')),
  storage_path text not null,
  alt_text text,
  rights_status text not null default 'pending' check (rights_status in ('pending','authorised','expired','restricted')),
  sort_order integer not null default 0,
  featured boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_plans (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  name text not null,
  season_name text,
  valid_from date,
  valid_to date,
  duration_minutes integer,
  amount_eur numeric(12,2),
  vat_included boolean not null default false,
  fuel_rule text,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists rate_plans_vessel_active_idx on public.rate_plans(vessel_id,active);

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null check (reason in ('booking','option','owner_use','maintenance','weather','manual')),
  booking_id uuid,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint availability_block_dates check (ends_at > starts_at)
);
create index if not exists availability_blocks_lookup_idx on public.availability_blocks(vessel_id,starts_at,ends_at);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  status public.lead_status not null default 'new',
  source text not null default 'website',
  preferred_date date,
  guests integer,
  duration_minutes integer,
  departure_area text,
  experience text,
  preferred_vessel_id uuid references public.vessels(id) on delete set null,
  extras jsonb not null default '[]'::jsonb,
  message text,
  assigned_to uuid references public.profiles(id) on delete set null,
  utm jsonb not null default '{}'::jsonb,
  first_response_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_status_created_idx on public.leads(status,created_at desc);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  vessel_id uuid references public.vessels(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','sent','accepted','expired','cancelled')),
  currency text not null default 'EUR',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  deposit_due numeric(12,2) not null default 0,
  expires_at timestamptz,
  terms_snapshot text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  kind text not null check (kind in ('charter','fuel','catering','toy','mooring','transfer','discount','other')),
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(6,3) not null default 0,
  total numeric(12,2) not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  client_id uuid not null references public.clients(id),
  lead_id uuid references public.leads(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  vessel_id uuid not null references public.vessels(id),
  status public.booking_status not null default 'enquiry',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  guests_adults integer not null default 1,
  guests_children integer not null default 0,
  departure_port text,
  itinerary text,
  allergies text,
  client_notes text,
  operational_notes text,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  deposit_status public.payment_status not null default 'not_due',
  balance_amount numeric(12,2) not null default 0,
  balance_status public.payment_status not null default 'not_due',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_dates check (ends_at > starts_at)
);
create index if not exists bookings_calendar_idx on public.bookings(starts_at,ends_at,status);
create index if not exists bookings_vessel_idx on public.bookings(vessel_id,starts_at);

alter table public.availability_blocks
  add constraint availability_blocks_booking_fk
  foreign key (booking_id) references public.bookings(id) on delete cascade;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text,
  provider_reference text,
  kind text not null check (kind in ('deposit','balance','refund','adjustment')),
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  status public.payment_status not null default 'due',
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.extras (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('catering','toy','transfer','celebration','other')),
  description text,
  pricing jsonb not null default '{}'::jsonb,
  lead_time_hours integer not null default 0,
  active boolean not null default true
);

create table if not exists public.booking_extras (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  extra_id uuid not null references public.extras(id),
  quantity numeric(10,2) not null default 1,
  price_snapshot numeric(12,2),
  notes text,
  primary key (booking_id,extra_id)
);

create table if not exists public.crew (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  role text,
  qualifications jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_crew (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  crew_id uuid not null references public.crew(id),
  duty text,
  primary key (booking_id,crew_id)
);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references public.vessels(id) on delete cascade,
  status public.maintenance_status not null default 'planned',
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  title text not null,
  description text,
  scheduled_from timestamptz,
  scheduled_to timestamptz,
  completed_at timestamptz,
  cost numeric(12,2),
  supplier text,
  documents jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists maintenance_vessel_status_idx on public.maintenance_tasks(vessel_id,status);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('page','vessel','experience','destination','guide','faq')),
  slug text not null,
  locale text not null check (locale in ('en','es','fr')),
  title text not null,
  body jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  published_at timestamptz,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_type,slug,locale)
);

create table if not exists public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301 check (status_code in (301,302,307,308)),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_entity_idx on public.audit_log(entity_type,entity_id,created_at desc);

-- RLS ----------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.owners enable row level security;
alter table public.vessels enable row level security;
alter table public.vessel_media enable row level security;
alter table public.rate_plans enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.extras enable row level security;
alter table public.booking_extras enable row level security;
alter table public.crew enable row level security;
alter table public.booking_crew enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.content_entries enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_log enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true $$;

create policy "staff profiles readable" on public.profiles
for select using (public.current_role() in ('admin','sales','operations','content'));

create policy "staff clients" on public.clients
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff owners" on public.owners
for all using (public.current_role() in ('admin','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "staff vessels" on public.vessels
for all using (public.current_role() in ('admin','sales','operations','content'))
with check (public.current_role() in ('admin','operations','content'));

create policy "public published vessels" on public.vessels
for select using (published = true and status = 'active');

create policy "staff media" on public.vessel_media
for all using (public.current_role() in ('admin','operations','content'))
with check (public.current_role() in ('admin','operations','content'));

create policy "staff rates" on public.rate_plans
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "staff availability" on public.availability_blocks
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "staff leads" on public.leads
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff quotes" on public.quotes
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff quote lines" on public.quote_lines
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff bookings" on public.bookings
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff payments" on public.payments
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff extras" on public.extras
for all using (public.current_role() in ('admin','sales','operations','content'))
with check (public.current_role() in ('admin','operations','content'));

create policy "staff booking extras" on public.booking_extras
for all using (public.current_role() in ('admin','sales','operations'))
with check (public.current_role() in ('admin','sales','operations'));

create policy "staff crew" on public.crew
for all using (public.current_role() in ('admin','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "staff booking crew" on public.booking_crew
for all using (public.current_role() in ('admin','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "staff maintenance" on public.maintenance_tasks
for all using (public.current_role() in ('admin','operations'))
with check (public.current_role() in ('admin','operations'));

create policy "content team" on public.content_entries
for all using (public.current_role() in ('admin','content'))
with check (public.current_role() in ('admin','content'));

create policy "public content" on public.content_entries
for select using (status = 'published');

create policy "redirect management" on public.redirects
for all using (public.current_role() in ('admin','content'))
with check (public.current_role() in ('admin','content'));

create policy "admin audit" on public.audit_log
for select using (public.current_role() = 'admin');

-- Owner-facing policies intentionally require an explicit owner-user mapping
-- migration before production. Never grant owners blanket access to bookings or
-- financial data until that mapping and field-level views have been reviewed.
