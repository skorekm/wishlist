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
