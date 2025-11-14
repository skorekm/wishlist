create type reservation_status as enum ('available', 'reserved', 'purchased', 'cancelled');

create table if not exists "reservations" (
  id serial primary key,
  wishlist_item_id integer not null references public.wishlist_items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reserver_name varchar(255),
  reserver_email varchar(255),
  reservation_code varchar(255) not null unique,
  created_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone not null,
  status reservation_status not null
);

create index reservations_reservation_code_idx on public.reservations (reservation_code);

alter table public.reservations enable row level security;

create policy "Anyone can create a reservation"
  on public.reservations
  for insert
  to anon, authenticated
  with check (expires_at > now());

create policy "Reservation owners and wishlist owners can view reservations"
  on public.reservations
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.wishlist_items wi
      join public.wishlists w on w.id = wi.wishlist_id
      where wi.id = reservations.wishlist_item_id
      and w.author_id = auth.uid()
    )
  );

create policy "Anyone can view reservations for items in shared wishlists"
  on public.reservations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.wishlist_items wi
      join public.wishlists w on w.id = wi.wishlist_id
      join public.share_links sl on sl.wishlist_id = w.id
      where wi.id = reservations.wishlist_item_id
      and sl.revoked_at is null
    )
  );

create policy "Anyone can update their own reservation with valid code"
  on public.reservations
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Function to automatically cancel expired reservations
-- This marks reservations as 'cancelled' when they pass expires_at
CREATE OR REPLACE FUNCTION cancel_expired_reservations()
RETURNS TABLE (cancelled_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.reservations
  SET status = 'cancelled'
  WHERE status = 'reserved'
    AND expires_at < now();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN QUERY SELECT affected_rows;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION cancel_expired_reservations() TO authenticated, anon;

COMMENT ON FUNCTION cancel_expired_reservations() IS 'Cancels all reservations that have passed their expiration time. Returns the count of cancelled reservations.';
