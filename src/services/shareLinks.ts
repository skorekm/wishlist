import { supabase } from "@/supabaseClient";

export async function generateShareLink(wishlistId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to generate a share link');
  }

  // Verify the user owns the wishlist
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('id', wishlistId)
    .eq('author_id', user.id)
    .single();

  if (wishlistError || !wishlist) {
    throw new Error('Wishlist not found or access denied');
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

  // First, verify the user owns the wishlist
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('author_id')
    .eq('id', wishlistId)
    .single();

  if (wishlistError || !wishlist) {
    throw new Error('Wishlist not found');
  }

  if (wishlist.author_id !== user.id) {
    throw new Error('You are not authorized to access this wishlist');
  }

  // Now query the share link
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

export async function regenerateShareLink(wishlistId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to regenerate a share link');
  }

  // Verify the user owns the wishlist
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('id', wishlistId)
    .eq('author_id', user.id)
    .single();

  if (wishlistError || !wishlist) {
    throw new Error('Wishlist not found or access denied');
  }

  // Delete any existing share links for this wishlist (revoked or not)
  const { error: deleteError } = await supabase
    .from('share_links')
    .delete()
    .eq('wishlist_id', wishlistId);

  if (deleteError) {
    throw deleteError;
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

