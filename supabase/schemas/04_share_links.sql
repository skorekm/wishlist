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

-- Authenticated users can view share links they created (no circular check)
create policy "Authenticated users can view share links they created"
  on public.share_links
  for select
  to authenticated
  using (created_by = (select auth.uid()));

-- Allow authenticated users to verify share links by token (same as anonymous)
create policy "Authenticated users can verify share links by token"
  on public.share_links
  as permissive
  for select
  to authenticated
  using (
    revoked_at IS NULL
  );

-- Add anonymous access policy to wishlists table (now that share_links exists)
-- This allows anyone with a valid share link to view the wishlist
create policy "Public can view wishlists via active share links"
  on public.wishlists
  for select
  to anon
  using (
    exists (
      select 1 from public.share_links
      where share_links.wishlist_id = wishlists.id
      and share_links.revoked_at is null
    )
  );

-- Allow authenticated users to view wishlists via active share links
create policy "Authenticated users can view wishlists via active share links"
  on public.wishlists
  for select
  to authenticated
  using (
    -- Allow viewing if there's an active share link for this wishlist
    exists (
      select 1 from public.share_links
      where share_links.wishlist_id = wishlists.id
      and share_links.revoked_at is null
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

-- Only authenticated users can create share links (ownership verified in service layer)
-- Simplified to avoid circular dependency with wishlists RLS policies
create policy "Users can create share links for their wishlists"
  on public.share_links
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
  );

-- Only the share link creator can update their share links
create policy "Users can update their share links"
  on public.share_links
  for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (
    created_by = (select auth.uid())
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

-- Only the share link creator can delete their share links
create policy "Users can delete their share links"
  on public.share_links
  for delete
  to authenticated
  using (created_by = (select auth.uid()));

-- Add indexes for performance
create index share_links_wishlist_id_idx on public.share_links (wishlist_id);
create index share_links_share_token_idx on public.share_links (share_token);
create index share_links_revoked_at_idx on public.share_links (revoked_at) where revoked_at is null;

