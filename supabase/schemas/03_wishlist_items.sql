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
  using (
    exists (
      select 1 from public.wishlists where public.wishlists.id = public.wishlist_items.wishlist_id
      )
  );
  

-- Users can insert wishlist items if they own the wishlist
create policy "Wishlist owners can insert items"
  on public.wishlist_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id
      and w.author_id = (select auth.uid())
    )
  );

-- Users can delete wishlist items if they own the wishlist
create policy "Wishlist owners can delete items"
  on public.wishlist_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id
      and w.author_id = (select auth.uid())
    )
  );

-- Users can update wishlist items if they own the wishlist
create policy "Wishlist owners can update items"
  on public.wishlist_items
  for update
  to authenticated
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id
      and w.author_id = (select auth.uid())
    )
  );

-- Add index on wishlist_id
create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);
