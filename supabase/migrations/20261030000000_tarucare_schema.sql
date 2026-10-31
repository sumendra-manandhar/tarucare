-- TARU CARE shop data.
--
-- Each table keeps the full record in `data` (the shape the app reads and writes) plus a few
-- generated columns so the Supabase Table Editor is easy to read and filter.
--
-- Only the server talks to these tables, using the service role key. Row level security is on
-- with no policies, and the anon/authenticated roles have no grants, so the public
-- (publishable/anon) key can neither read nor change anything.

create table if not exists public.products (
  id          text primary key,
  data        jsonb not null,
  position    integer not null default 0,
  name        text    generated always as (data ->> 'name') stored,
  price       numeric generated always as ((data ->> 'price')::numeric) stored,
  stock       integer generated always as ((data ->> 'stock')::integer) stored,
  published   boolean generated always as ((data ->> 'published')::boolean) stored,
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id             text primary key,
  data           jsonb not null,
  created_at     timestamptz not null default now(),
  status         text    generated always as (data ->> 'status') stored,
  total          numeric generated always as ((data ->> 'total')::numeric) stored,
  payment        text    generated always as (data ->> 'payment') stored,
  customer_name  text    generated always as (data -> 'customer' ->> 'name') stored,
  customer_phone text    generated always as (data -> 'customer' ->> 'phone') stored,
  customer_id    text    generated always as (data ->> 'customerId') stored,
  updated_at     timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

create table if not exists public.customers (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  name        text generated always as (data ->> 'name') stored,
  email       text generated always as (data ->> 'email') stored,
  phone       text generated always as (data ->> 'phone') stored,
  city        text generated always as (data ->> 'city') stored,
  updated_at  timestamptz not null default now()
);

create table if not exists public.inquiries (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  type        text generated always as (data ->> 'type') stored,
  status      text generated always as (data ->> 'status') stored,
  name        text generated always as (data ->> 'name') stored,
  email       text generated always as (data ->> 'email') stored,
  updated_at  timestamptz not null default now()
);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

create table if not exists public.staff (
  id          text primary key,
  data        jsonb not null,  -- includes the scrypt password hash, never the password
  position    integer not null default 0,
  name        text    generated always as (data ->> 'name') stored,
  email       text    generated always as (data ->> 'email') stored,
  role_id     text    generated always as (data ->> 'roleId') stored,
  active      boolean generated always as ((data ->> 'active')::boolean) stored,
  updated_at  timestamptz not null default now()
);

create table if not exists public.roles (
  id          text primary key,
  data        jsonb not null,
  position    integer not null default 0,
  name        text generated always as (data ->> 'name') stored,
  updated_at  timestamptz not null default now()
);

create table if not exists public.settings (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Short-lived lock so two orders placed at once can't both take the last bars in stock.
create table if not exists public.taru_locks (
  name        text primary key,
  token       text not null,
  expires_at  timestamptz not null
);

-- Counters for rate limits on sign-in, orders and the contact form.
create table if not exists public.taru_rate_hits (
  key         text primary key,
  count       integer not null,
  reset_at    timestamptz not null
);

do $$
declare t text;
begin
  foreach t in array array['products', 'orders', 'customers', 'inquiries', 'staff', 'roles', 'settings', 'taru_locks', 'taru_rate_hits'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Takes the lock if it is free or its holder's time has run out. Returns true when taken.
create or replace function public.taru_try_lock(p_name text, p_token text, p_ttl_ms integer)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  insert into public.taru_locks (name, token, expires_at)
  values (p_name, p_token, now() + make_interval(secs => p_ttl_ms / 1000.0))
  on conflict (name) do update
    set token = excluded.token, expires_at = excluded.expires_at
    where public.taru_locks.expires_at < now();
  return found;
end;
$$;

create or replace function public.taru_unlock(p_name text, p_token text)
returns void
language sql
set search_path = ''
as $$
  delete from public.taru_locks where name = p_name and token = p_token;
$$;

-- Counts a hit in a fixed window and returns the count so far in that window.
create or replace function public.taru_hit(p_key text, p_window_ms integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare n integer;
begin
  insert into public.taru_rate_hits (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count    = case when public.taru_rate_hits.reset_at < now() then 1 else public.taru_rate_hits.count + 1 end,
        reset_at = case when public.taru_rate_hits.reset_at < now() then excluded.reset_at else public.taru_rate_hits.reset_at end
  returning count into n;
  return n;
end;
$$;

-- Saves one change to the shop in a single transaction: every listed row is written, or none.
-- p_changes looks like {"orders": {"upsert": [{"id", "data", "created_at"}], "delete": ["id"]},
--                       "products": {"upsert": [{"id", "data", "position"}], ...}, "settings": {...}}
create or replace function public.taru_save(p_changes jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  t text;
begin
  foreach t in array array['products', 'orders', 'customers', 'inquiries', 'staff', 'roles'] loop
    if p_changes ? t then
      execute format('delete from public.%I where id in (select jsonb_array_elements_text($1))', t)
        using coalesce(p_changes -> t -> 'delete', '[]'::jsonb);
      if t in ('products', 'staff', 'roles') then
        execute format(
          'insert into public.%I (id, data, position)
             select x.id, x.data, x.position from jsonb_to_recordset($1) as x(id text, data jsonb, position integer)
           on conflict (id) do update set data = excluded.data, position = excluded.position, updated_at = now()', t)
          using coalesce(p_changes -> t -> 'upsert', '[]'::jsonb);
      else
        execute format(
          'insert into public.%I (id, data, created_at)
             select x.id, x.data, x.created_at from jsonb_to_recordset($1) as x(id text, data jsonb, created_at timestamptz)
           on conflict (id) do update set data = excluded.data, updated_at = now()', t)
          using coalesce(p_changes -> t -> 'upsert', '[]'::jsonb);
      end if;
    end if;
  end loop;
  if p_changes ? 'settings' then
    insert into public.settings (id, data) values (1, p_changes -> 'settings')
    on conflict (id) do update set data = excluded.data, updated_at = now();
  end if;
end;
$$;

revoke all on function public.taru_save(jsonb) from public, anon, authenticated;
grant execute on function public.taru_save(jsonb) to service_role;

revoke all on function public.taru_try_lock(text, text, integer) from public, anon, authenticated;
revoke all on function public.taru_unlock(text, text) from public, anon, authenticated;
revoke all on function public.taru_hit(text, integer) from public, anon, authenticated;
grant execute on function public.taru_try_lock(text, text, integer) to service_role;
grant execute on function public.taru_unlock(text, text) to service_role;
grant execute on function public.taru_hit(text, integer) to service_role;
