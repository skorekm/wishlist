-- share_links table for managing shareable wishlist links
create table if not exists "share_links" (
  id serial primary key,
  wishlist_id integer not null references public.wishlists(id) on delete cascade,
  share_token uuid not null default gen_random_uuid() unique,
  created_at timestamp with time zone default now() not null,
  created_by uuid references auth.users(id) not null,
  revoked_at timestamp with time zone,
  last_accessed_at timestamp with time zone
);

-- Add row-level security policies
alter table public.share_links enable row level security;

-- Create policies
-- Anyone with a valid (non-revoked) share token can read the share link
create policy "Anyone can view non-revoked share links by token"
  on public.share_links
  for select
  using (revoked_at is null);

-- Only authenticated users can create share links for their own wishlists
create policy "Users can create share links for their own wishlists"
  on public.share_links
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.wishlists
      where wishlists.id = share_links.wishlist_id
      and wishlists.author_id = (select auth.uid())
    )
    and share_links.created_by = (select auth.uid())
  );

-- Only the wishlist owner can update (revoke) their share links
create policy "Users can update their own share links"
  on public.share_links
  for update
  to authenticated
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = share_links.wishlist_id
      and wishlists.author_id = (select auth.uid())
    )
  );

-- Only the wishlist owner can delete their share links
create policy "Users can delete their own share links"
  on public.share_links
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = share_links.wishlist_id
      and wishlists.author_id = (select auth.uid())
    )
  );

-- Add indexes for performance
create index share_links_wishlist_id_idx on public.share_links (wishlist_id);
create index share_links_share_token_idx on public.share_links (share_token);
create index share_links_revoked_at_idx on public.share_links (revoked_at) where revoked_at is null;

