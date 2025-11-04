create table permissions (
  id serial primary key,
  name varchar(100) not null,
  description varchar(100) not null
);

alter table public.permissions enable row level security;

-- Indexes
create index permissions_name_idx on public.permissions (name);
create index permissions_description_idx on public.permissions (description);

create policy "Authenticated users can view permissions"
  on public.permissions
  for select
  to authenticated
  using (true);

-- wishlist_permissions table
create table wishlist_permissions (
  id serial primary key,
  permission_id integer not null references permissions(id) on delete cascade,
  wishlist_id integer not null references wishlists(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  constraint unique_wishlist_user_permission unique (wishlist_id, user_id, permission_id)
);

-- Add row-level security policies
alter table public.wishlist_permissions enable row level security;

-- Indexes
create index wishlist_permissions_wishlist_id_idx on public.wishlist_permissions (wishlist_id);
create index wishlist_permissions_user_id_idx on public.wishlist_permissions (user_id);
create index wishlist_permissions_permission_id_idx on public.wishlist_permissions (permission_id);

-- Add wishlist SELECT policy that depends on permissions tables
-- Users can view wishlists they have been granted permission to access
create policy "Users can view wishlists they have permission to access"
  on public.wishlists
  for select
  to authenticated
  using (
    exists (
      select 1 from public.wishlist_permissions wp
      join public.permissions p on wp.permission_id = p.id
      where wp.wishlist_id = wishlists.id
      and wp.user_id = (select auth.uid())
      and p.name = 'wishlist:view'
    )
  );

-- RLS policies for wishlist_permissions
-- Users can view permissions they have been granted
create policy "Users can view their own permissions"
  on public.wishlist_permissions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users who created permissions (wishlist owners) can view all permissions they created
-- This avoids circular dependency by checking created_by instead of querying wishlists table
create policy "Permission creators can view permissions they created"
  on public.wishlist_permissions
  for select
  to authenticated
  using (created_by = (select auth.uid()));

-- Permission creators can grant permissions
-- Check created_by to avoid circular dependency with wishlists
create policy "Permission creators can grant permissions"
  on public.wishlist_permissions
  for insert
  to authenticated
  with check (created_by = (select auth.uid()));

-- Permission creators can revoke permissions they created
create policy "Permission creators can revoke permissions"
  on public.wishlist_permissions
  for delete
  to authenticated
  using (created_by = (select auth.uid()));

-- Permission creators can update permissions they created
create policy "Permission creators can update permissions"
  on public.wishlist_permissions
  for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
