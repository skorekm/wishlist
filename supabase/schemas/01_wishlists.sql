-- wishlists table
create table if not exists "wishlists" (
  id serial primary key,
  uuid uuid not null default gen_random_uuid(),
  name varchar(100) not null,
  description varchar(250),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  author_id uuid references auth.users(id) not null
);

-- Add row-level security policies
alter table public.wishlists enable row level security;

-- Create policies
create policy "Unauthenticated users can view wishlists"
  on public.wishlists
  for select
  using (true);

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

-- Add index on author_id
create index wishlists_author_id_idx on public.wishlists (author_id);
