-- enum priority (low, medium, high)
create type priority as enum ('low', 'medium', 'high');

-- wishlist_items table
create table if not exists "wishlist_items" (
  id serial primary key,
  name varchar(100) not null,
  price numeric not null,
  currency integer references currencies(id) not null,
  priority priority not null,
  category varchar(100),
  link varchar(255),
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  wishlist_id integer references wishlists(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null
);

-- Add row-level security policies
alter table public.wishlist_items enable row level security;


create policy "Users who know the wishlist uuid can view the wishlist items"
  on public.wishlist_items
  for select
  using (true);

create policy "Users can insert new wishlist items when authenticated"
  on public.wishlist_items
  for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Users can only delete their own wishlist items"
  on public.wishlist_items
  for delete
  using ((select auth.uid()) = author_id);

create policy "Users can update their own wishlist items"
  on public.wishlist_items
  for update
  using ((select auth.uid()) = author_id);

-- Add index on wishlist_id
create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);
