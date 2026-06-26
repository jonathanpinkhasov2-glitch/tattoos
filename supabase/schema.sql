-- ═══════════════════════════════════════════════════════════
--  TattooOS — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── STUDIOS ────────────────────────────────────────────────
create table if not exists studios (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  slug          text unique not null,
  bio           text,
  address       text,
  city          text,
  state         text,
  zip           text,
  phone         text,
  email         text,
  website       text,
  instagram     text,
  timezone      text default 'America/New_York',
  logo_url      text,
  cover_url     text,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  subscription_plan       text check (subscription_plan in ('solo','studio','pro')) default 'solo',
  subscription_status     text default 'trialing',
  trial_ends_at           timestamptz default (now() + interval '14 days'),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── ARTISTS ────────────────────────────────────────────────
create table if not exists artists (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  studio_id     uuid references studios(id) on delete cascade not null,
  name          text not null,
  slug          text unique not null,
  email         text,
  bio           text,
  specialties   text[],
  styles        text[],
  avatar_url    text,
  instagram     text,
  is_owner      boolean default false,
  booking_enabled       boolean default true,
  deposit_required      boolean default true,
  deposit_type          text check (deposit_type in ('flat','percent')) default 'flat',
  deposit_amount        numeric(10,2) default 50.00,
  deposit_percentage    int default 30,
  min_session_minutes   int default 60,
  max_advance_days      int default 90,
  buffer_minutes        int default 15,
  hourly_rate           numeric(10,2),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── ARTIST AVAILABILITY ────────────────────────────────────
create table if not exists availability (
  id            uuid primary key default uuid_generate_v4(),
  artist_id     uuid references artists(id) on delete cascade not null,
  day_of_week   int check (day_of_week between 0 and 6) not null, -- 0=Sun
  start_time    time not null,
  end_time      time not null,
  created_at    timestamptz default now()
);

-- ─── BLOCKED DATES ──────────────────────────────────────────
create table if not exists blocked_dates (
  id            uuid primary key default uuid_generate_v4(),
  artist_id     uuid references artists(id) on delete cascade not null,
  blocked_date  date not null,
  reason        text,
  created_at    timestamptz default now()
);

-- ─── CLIENTS ────────────────────────────────────────────────
create table if not exists clients (
  id            uuid primary key default uuid_generate_v4(),
  studio_id     uuid references studios(id) on delete cascade not null,
  artist_id     uuid references artists(id) on delete set null,
  first_name    text not null,
  last_name     text,
  email         text,
  phone         text,
  date_of_birth date,
  pronouns      text,
  notes         text,
  allergies     text,
  medical_notes text,
  referral_source text,
  is_blocked    boolean default false,
  total_sessions  int default 0,
  total_spent     numeric(10,2) default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── DESIGN REFERENCES ──────────────────────────────────────
create table if not exists design_references (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid references clients(id) on delete cascade not null,
  booking_id    uuid,  -- linked later
  url           text not null,
  type          text check (type in ('reference','stencil','healed','progress','other')) default 'reference',
  notes         text,
  created_at    timestamptz default now()
);

-- ─── BOOKINGS ───────────────────────────────────────────────
create table if not exists bookings (
  id                  uuid primary key default uuid_generate_v4(),
  studio_id           uuid references studios(id) on delete cascade not null,
  artist_id           uuid references artists(id) on delete cascade not null,
  client_id           uuid references clients(id),
  -- Client info snapshot (for new clients who aren't in system yet)
  client_name         text not null,
  client_email        text not null,
  client_phone        text,
  -- Booking details
  tattoo_description  text,
  placement           text,
  size                text check (size in ('small','medium','large','full_sleeve','other')),
  style               text,
  is_color            boolean default false,
  is_cover_up         boolean default false,
  -- Schedule
  scheduled_at        timestamptz not null,
  duration_minutes    int not null default 120,
  -- Status
  status              text check (status in ('pending','confirmed','completed','cancelled','no_show')) default 'pending',
  -- Payments
  deposit_amount      numeric(10,2) default 0,
  deposit_paid        boolean default false,
  deposit_paid_at     timestamptz,
  session_price       numeric(10,2),
  total_paid          numeric(10,2) default 0,
  stripe_payment_intent_id text,
  -- Reminders
  reminder_24h_sent   boolean default false,
  reminder_2h_sent    boolean default false,
  -- Meta
  notes               text,
  cancellation_reason text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── CONSENT FORMS ──────────────────────────────────────────
create table if not exists consent_forms (
  id              uuid primary key default uuid_generate_v4(),
  booking_id      uuid references bookings(id) on delete cascade not null,
  client_id       uuid references clients(id),
  token           text unique default gen_random_uuid()::text,
  -- Form data
  full_name       text,
  date_of_birth   date,
  email           text,
  phone           text,
  medical_notes   text,
  -- Health questions
  is_pregnant           boolean default false,
  has_blood_disorder    boolean default false,
  has_skin_condition    boolean default false,
  has_allergies         boolean default false,
  allergy_details       text,
  on_blood_thinners     boolean default false,
  medications           text,
  additional_health     text,
  -- Consent acknowledgments
  consent_age_verified  boolean not null default false,
  consent_health_true   boolean not null default false,
  consent_aftercare     boolean not null default false,
  consent_photo_release boolean default false,
  consent_no_guarantee  boolean not null default false,
  -- Signature
  signature_url   text,  -- stored in Supabase Storage
  signed_at       timestamptz,
  ip_address      text,
  -- Status
  status          text check (status in ('pending','signed','expired')) default 'pending',
  sent_at         timestamptz,
  created_at      timestamptz default now()
);

-- ─── WAITLIST ───────────────────────────────────────────────
create table if not exists waitlist (
  id            uuid primary key default uuid_generate_v4(),
  artist_id     uuid references artists(id) on delete cascade not null,
  client_name   text not null,
  client_email  text not null,
  client_phone  text,
  tattoo_description  text,
  placement     text,
  size          text,
  preferred_days      text[],  -- ['monday','friday']
  flexible_schedule   boolean default true,
  deposit_paid        boolean default false,
  deposit_amount      numeric(10,2) default 0,
  stripe_payment_intent_id text,
  priority      int default 0,
  status        text check (status in ('waiting','contacted','booked','removed')) default 'waiting',
  offered_at    timestamptz,
  notes         text,
  created_at    timestamptz default now()
);

-- ─── REVIEWS ────────────────────────────────────────────────
create table if not exists reviews (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid references bookings(id) on delete cascade not null,
  artist_id     uuid references artists(id) on delete cascade not null,
  rating        int check (rating between 1 and 5) not null,
  comment       text,
  is_public     boolean default true,
  created_at    timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table studios           enable row level security;
alter table artists           enable row level security;
alter table availability      enable row level security;
alter table blocked_dates     enable row level security;
alter table clients           enable row level security;
alter table design_references enable row level security;
alter table bookings          enable row level security;
alter table consent_forms     enable row level security;
alter table waitlist          enable row level security;
alter table reviews           enable row level security;

-- Studios: owner can do anything
create policy "studio_owner_all" on studios
  for all using (owner_id = auth.uid());

-- Artists: studio owner can manage their artists
create policy "artist_studio_owner" on artists
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );

-- Public read for booking pages
create policy "artist_public_read" on artists
  for select using (booking_enabled = true);

create policy "studio_public_read" on studios
  for select using (true);

-- Availability: artists can manage their own
create policy "availability_artist_manage" on availability
  for all using (
    artist_id in (
      select id from artists where studio_id in (
        select id from studios where owner_id = auth.uid()
      )
    )
  );

create policy "availability_public_read" on availability
  for select using (true);

-- Clients: studio owner only
create policy "clients_studio_owner" on clients
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );

-- Bookings: studio owner full access; public insert (for booking form)
create policy "bookings_studio_owner" on bookings
  for all using (
    studio_id in (select id from studios where owner_id = auth.uid())
  );

create policy "bookings_public_insert" on bookings
  for insert with check (true);

-- Consent forms: public insert (clients sign), owner reads
create policy "consent_forms_studio_owner" on consent_forms
  for select using (
    booking_id in (
      select id from bookings where studio_id in (
        select id from studios where owner_id = auth.uid()
      )
    )
  );

create policy "consent_forms_public_insert" on consent_forms
  for insert with check (true);

create policy "consent_forms_public_update" on consent_forms
  for update using (true);

-- Waitlist: studio owner full access; public insert
create policy "waitlist_studio_owner" on waitlist
  for all using (
    artist_id in (
      select id from artists where studio_id in (
        select id from studios where owner_id = auth.uid()
      )
    )
  );

create policy "waitlist_public_insert" on waitlist
  for insert with check (true);

-- ─── INDEXES ────────────────────────────────────────────────
create index if not exists idx_bookings_artist_date    on bookings(artist_id, scheduled_at);
create index if not exists idx_bookings_studio         on bookings(studio_id);
create index if not exists idx_bookings_status         on bookings(status);
create index if not exists idx_clients_studio          on clients(studio_id);
create index if not exists idx_clients_email           on clients(email);
create index if not exists idx_waitlist_artist         on waitlist(artist_id);
create index if not exists idx_availability_artist_day on availability(artist_id, day_of_week);
create index if not exists idx_artists_slug            on artists(slug);
create index if not exists idx_studios_slug            on studios(slug);

-- ─── FUNCTIONS ──────────────────────────────────────────────

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger studios_updated_at   before update on studios   for each row execute function update_updated_at();
create trigger artists_updated_at   before update on artists   for each row execute function update_updated_at();
create trigger clients_updated_at   before update on clients   for each row execute function update_updated_at();
create trigger bookings_updated_at  before update on bookings  for each row execute function update_updated_at();

-- Get artist stats
create or replace function get_artist_stats(p_artist_id uuid, p_month date default date_trunc('month', now())::date)
returns table(
  total_bookings    bigint,
  completed         bigint,
  revenue           numeric,
  new_clients       bigint,
  avg_session_mins  numeric
) as $$
begin
  return query
  select
    count(*)                                                        as total_bookings,
    count(*) filter (where b.status = 'completed')                  as completed,
    coalesce(sum(b.total_paid) filter (where b.status = 'completed'), 0) as revenue,
    count(distinct b.client_id) filter (where c.total_sessions = 1) as new_clients,
    avg(b.duration_minutes)                                         as avg_session_mins
  from bookings b
  left join clients c on c.id = b.client_id
  where b.artist_id = p_artist_id
    and date_trunc('month', b.scheduled_at) = date_trunc('month', p_month::timestamptz);
end;
$$ language plpgsql security definer; 
