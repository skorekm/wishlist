-- wishlists table
create table if not exists "wishlists" (
  id serial primary key,
  uuid uuid not null default gen_random_uuid() unique,
  name varchar(100) not null,
  description varchar(250),
  event_date date,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  author_id uuid references auth.users(id) not null
);

-- Add row-level security policies
alter table public.wishlists enable row level security;

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

-- Add permission assignment
create or replace function assign_author_permissions()
returns trigger as $$
begin
  -- Assign all author/owner permissions for the wishlist
  insert into public.wishlist_permissions (wishlist_id, user_id, permission_id, created_by)
  select 
    new.id,
    new.author_id,
    p.id,
    new.author_id
  from public.permissions p
  where p.name in (
    'wishlist:view',
    'wishlist:edit',
    'wishlist:delete',
    'wishlist:share',
    'wishlist_item:create',
    'wishlist_item:edit',
    'wishlist_item:delete'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger assign_author_permissions_trigger
  after insert on public.wishlists
  for each row
  execute function assign_author_permissions();
