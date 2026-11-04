-- Tally counter: categories, games, categories_tally
-- Run in the Supabase SQL editor, or `supabase db push` if you use the CLI.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.categories (
  id   bigint generated always as identity primary key,
  name text not null unique
);

create table public.games (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamptz not null default now()
);

create table public.categories_tally (
  id          uuid primary key default gen_random_uuid(),
  game_id     uuid   not null references public.games (id) on delete cascade,
  category_id bigint not null references public.categories (id) on delete cascade,
  count       int4   not null default 0 check (count >= 0),
  unique (game_id, category_id)
);

create index categories_tally_game_id_idx on public.categories_tally (game_id);

-- ---------------------------------------------------------------------------
-- Seed the eight categories (rename freely — order follows id)
-- ---------------------------------------------------------------------------

insert into public.categories (name) values
  ('Goals'),
  ('Assists'),
  ('Blocks'),
  ('Throwaways'),
  ('Drops'),
  ('Stalls'),
  ('Callahans'),
  ('Pulls');

-- ---------------------------------------------------------------------------
-- When a game is created, give it a zeroed tally row for every category
-- ---------------------------------------------------------------------------

create or replace function public.create_game_tallies()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.categories_tally (game_id, category_id)
  select new.id, c.id from public.categories c
  on conflict (game_id, category_id) do nothing;
  return new;
end;
$$;

create trigger games_create_tallies
after insert on public.games
for each row execute function public.create_game_tallies();

-- ---------------------------------------------------------------------------
-- Atomic +/- (never drops below zero). Returns the new count.
-- ---------------------------------------------------------------------------

create or replace function public.increment_tally(
  p_game_id uuid,
  p_category_id bigint,
  p_delta int
)
returns int4
language sql
security invoker
set search_path = ''
as $$
  insert into public.categories_tally (game_id, category_id, count)
  values (p_game_id, p_category_id, greatest(0, p_delta))
  on conflict (game_id, category_id)
  do update set count = greatest(0, public.categories_tally.count + p_delta)
  returning count;
$$;

-- ---------------------------------------------------------------------------
-- Access: signed-in users only. Everyone signed in shares the same games.
-- ---------------------------------------------------------------------------

alter table public.categories       enable row level security;
alter table public.games            enable row level security;
alter table public.categories_tally enable row level security;

create policy "authenticated read categories"
  on public.categories for select to authenticated using (true);

create policy "authenticated manage games"
  on public.games for all to authenticated using (true) with check (true);

create policy "authenticated manage tallies"
  on public.categories_tally for all to authenticated using (true) with check (true);

revoke all on public.categories, public.games, public.categories_tally from anon;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.games, public.categories_tally to authenticated;

revoke execute on function public.increment_tally(uuid, bigint, int) from public, anon;
grant execute on function public.increment_tally(uuid, bigint, int) to authenticated;
revoke execute on function public.create_game_tallies() from public, anon;
