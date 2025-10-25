import { supabase } from "@/supabaseClient";

export async function generateShareLink(wishlistId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to generate a share link');
  }

  // Check if there's already an active share link for this wishlist
  const { data: existingLink } = await supabase
    .from('share_links')
    .select('*')
    .eq('wishlist_id', wishlistId)
    .is('revoked_at', null)
    .single();

  if (existingLink) {
    return existingLink;
  }

  // Create a new share link
  const { data, error } = await supabase
    .from('share_links')
    .insert({
      wishlist_id: wishlistId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getShareLink(wishlistId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to get share link');
  }

  const { data, error } = await supabase
    .from('share_links')
    .select('*')
    .eq('wishlist_id', wishlistId)
    .is('revoked_at', null)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error;
  }

  return data;
}

export async function revokeShareLink(shareTokenOrId: string | number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to revoke a share link');
  }

  const isToken = typeof shareTokenOrId === 'string';
  const query = supabase
    .from('share_links')
    .update({ revoked_at: new Date().toISOString() });

  if (isToken) {
    query.eq('share_token', shareTokenOrId);
  } else {
    query.eq('id', shareTokenOrId);
  }

  const { data, error } = await query.select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWishlistByShareToken(shareToken: string) {
  // First, verify the share link exists and is not revoked
  const { data: shareLink, error: shareLinkError } = await supabase
    .from('share_links')
    .select('wishlist_id')
    .eq('share_token', shareToken)
    .is('revoked_at', null)
    .single();

  if (shareLinkError) {
    throw new Error('Invalid or revoked share link');
  }

  // Update last_accessed_at
  await supabase
    .from('share_links')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('share_token', shareToken);

  // Get the wishlist with items
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('*, items:wishlist_items(*, currency:currencies(code))')
    .eq('id', shareLink.wishlist_id)
    .single();

  if (wishlistError) {
    throw wishlistError;
  }

  return wishlist;
}

