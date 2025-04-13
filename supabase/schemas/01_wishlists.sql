-- wishlists table
create table if not exists "wishlists" (
  id serial primary key,
  name varchar(100) not null,
  description varchar(250),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  author_id uuid references auth.users(id) not null
);

-- Add row-level security policies
alter table public.wishlists enable row level security;

-- Create policies
create policy "Users can view their own wishlists"
  on public.wishlists
  for select
  using (auth.uid() = author_id);

create policy "Users can insert new wishlists when authenticated"
  on public.wishlists
  for insert
  to authenticated
  with check (true);

create policy "Users can only delete their own wishlists"
  on public.wishlists
  for delete
  using (auth.uid() = author_id);