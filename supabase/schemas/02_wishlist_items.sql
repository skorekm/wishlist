-- enum priority (low, medium, high)
create type priority as enum ('low', 'medium', 'high');

-- wishlist_items table
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
  author_id uuid references auth.users(id) not null
);
