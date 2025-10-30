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
-- SECURITY NOTE: Only authenticated wishlist owners can read their share links.
-- Public access to shared wishlists should be handled via a PostgreSQL SECURITY DEFINER 
-- function or Supabase Edge Function that validates the share_token and returns wishlist 
-- data, bypassing RLS. The previous policy allowed unauthenticated reads of ALL non-revoked 
-- share_links, which could expose all active share tokens to malicious enumeration.
-- TODO: Refactor getWishlistByShareToken() in services/shareLinks.ts to use a secure function.
create policy "Wishlist owners can view their own share links"
  on public.share_links
  for select
  to authenticated
  using (
    exists (
      select 1 from public.wishlists
      where wishlists.id = share_links.wishlist_id
      and wishlists.author_id = (select auth.uid())
    )
  );

-- Allow anonymous users to verify share links by token
create policy "Anyone can verify share links by token"
  on public.share_links
  as permissive
  for select
  to anon
  using (
    revoked_at IS NULL
  );

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
  )
  with check (
    -- Ensure the wishlist is still owned by the current user
    exists (
      select 1 from public.wishlists
      where wishlists.id = share_links.wishlist_id
      and wishlists.author_id = (select auth.uid())
    )
    -- Ensure created_by hasn't been tampered with
    and share_links.created_by = (select auth.uid())
    -- Ensure immutable field share_token hasn't changed
    and share_links.share_token = (
      select share_token from public.share_links as old_sl
      where old_sl.id = share_links.id
    )
    -- Ensure immutable field wishlist_id hasn't changed
    and share_links.wishlist_id = (
      select wishlist_id from public.share_links as old_sl
      where old_sl.id = share_links.id
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

