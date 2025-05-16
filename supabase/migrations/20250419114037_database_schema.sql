-- First, create the priority enum type
create type priority as enum ('low', 'medium', 'high');

-- Create wishlists table
create table if not exists "wishlists" (
  id serial primary key,
  name varchar(100) not null,
  description varchar(250),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  author_id uuid references auth.users(id) not null
);

-- Create wishlist_items table
create table if not exists "wishlist_items" (
  id serial primary key,
  name varchar(100) not null,
  price numeric not null,
  priority priority not null,
  category varchar(100),
  link varchar(255),
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  wishlist_id integer references wishlists(id) not null,
  author_id uuid references auth.users(id) on delete cascade not null 
);

-- Add RLS for wishlists
alter table public.wishlists enable row level security;

create policy "Users can view their own wishlists"
  on public.wishlists
  for select
  using ((select auth.uid()) = author_id);

create policy "Users can insert new wishlists when authenticated"
  on public.wishlists
  for insert
  to authenticated
  with check (true);

create policy "Users can only delete their own wishlists"
  on public.wishlists
  for delete
  using ((select auth.uid()) = author_id);

create policy "Users can update their own wishlists"
  on public.wishlists
  for update
  using ((select auth.uid()) = author_id);

-- Add RLS for wishlist_items
alter table public.wishlist_items enable row level security;

create policy "Users can view their own wishlist items"
  on public.wishlist_items
  for select
  using ((select auth.uid()) = author_id);

create policy "Users can insert new wishlist items when authenticated"
  on public.wishlist_items
  for insert
  to authenticated
  with check (true);

create policy "Users can only delete their own wishlist items"
  on public.wishlist_items
  for delete
  using ((select auth.uid()) = author_id);

create policy "Users can update their own wishlist items"
  on public.wishlist_items
  for update
  using ((select auth.uid()) = author_id);

-- Add indexes
create index wishlists_author_id_idx on public.wishlists (author_id);
create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);