-- =============================================
-- EventHub Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- EVENTS TABLE
-- =============================================
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  event_date date not null,
  event_time time not null,
  capacity integer not null default 50,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- REGISTRATIONS TABLE
-- =============================================
create table if not exists public.registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ticket_code text unique not null default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'registered' check (status in ('registered', 'checked_in', 'cancelled')),
  checked_in_at timestamptz,
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

-- Profiles policies
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Events policies
create policy "Anyone can view published events" on public.events for select using (status = 'published' or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can insert events" on public.events for insert with check (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can update events" on public.events for update using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can delete events" on public.events for delete using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Registrations policies
create policy "Users can view own registrations" on public.registrations for select using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Users can register for events" on public.registrations for insert with check (auth.uid() = user_id);
create policy "Users can cancel own registrations" on public.registrations for update using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can delete registrations" on public.registrations for delete using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_registrations_event_id on public.registrations(event_id);
create index if not exists idx_registrations_user_id on public.registrations(user_id);
create index if not exists idx_registrations_ticket_code on public.registrations(ticket_code);
create index if not exists idx_events_status on public.events(status);

-- =============================================
-- HELPER FUNCTION: Check-in by ticket code
-- =============================================
create or replace function public.checkin_by_ticket(p_ticket_code text)
returns json as $$
declare
  v_reg record;
begin
  select r.*, e.title as event_title, p.full_name, p.email
  into v_reg
  from public.registrations r
  join public.events e on r.event_id = e.id
  join public.profiles p on r.user_id = p.id
  where r.ticket_code = p_ticket_code;

  if not found then
    return json_build_object('success', false, 'message', 'Ticket not found');
  end if;

  if v_reg.status = 'checked_in' then
    return json_build_object('success', false, 'message', 'Already checked in', 'data', row_to_json(v_reg));
  end if;

  if v_reg.status = 'cancelled' then
    return json_build_object('success', false, 'message', 'Registration cancelled');
  end if;

  update public.registrations
  set status = 'checked_in', checked_in_at = now()
  where ticket_code = p_ticket_code;

  return json_build_object('success', true, 'message', 'Check-in successful', 'full_name', v_reg.full_name, 'email', v_reg.email, 'event_title', v_reg.event_title);
end;
$$ language plpgsql security definer;
