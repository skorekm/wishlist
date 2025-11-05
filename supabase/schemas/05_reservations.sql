create type reservation_status as enum ('available', 'reserved', 'purchased', 'cancelled');

create table if not exists "reservations" (
  id serial primary key,
  wishlist_item_id integer not null references public.wishlist_items(id) on delete cascade,
  user_id varchar(255),
  reserver_name varchar(255),
  reserver_email varchar(255),
  reservation_code varchar(255) not null,
  created_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone not null,
  status reservation_status not null
);

alter table public.reservations enable row level security;

create policy "Anyone can create a reservation"
  on public.reservations
  for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can view a reservation"
  on public.reservations
  for select
  to anon, authenticated
  using (true);

create policy "Wishlist owners can view the full reservation details"
  on public.reservations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wishlist_items wi
      join public.wishlists w on w.id = wi.wishlist_id
      where wi.id = reservations.wishlist_item_id
      and w.author_id = auth.uid()
    )
  )