-- increment_tally: atomic +/- for one category in one game. Never goes below 0.
-- Argument types are taken from your categories_tally columns (%TYPE), so this
-- works whether game_id / category_id are uuid, bigint, int, etc.
-- Doesn't require a unique constraint, but see the optional one at the bottom.

create or replace function public.increment_tally(
  p_game_id     public.categories_tally.game_id%type,
  p_category_id public.categories_tally.category_id%type,
  p_delta       int
)
returns int4
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_count int4;
begin
  update public.categories_tally
     set count = greatest(0, count + p_delta)
   where game_id = p_game_id
     and category_id = p_category_id
  returning count into new_count;

  if not found then
    insert into public.categories_tally (game_id, category_id, count)
    values (p_game_id, p_category_id, greatest(0, p_delta))
    returning count into new_count;
  end if;

  return new_count;
end;
$$;

grant execute on function public.increment_tally to authenticated;

-- Make PostgREST pick up the new function immediately (otherwise you can get a
-- 404 / PGRST202 until its schema cache refreshes).
notify pgrst, 'reload schema';

-- Optional but recommended: one tally row per category per game.
-- Fails if you already have duplicates — that's a sign you need it.
-- alter table public.categories_tally
--   add constraint categories_tally_game_category_key unique (game_id, category_id);
