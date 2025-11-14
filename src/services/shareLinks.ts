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

export async function getWishlistByShareToken(shareToken: string, reservationCode?: string) {
  // Clean up expired reservations before fetching
  await supabase.rpc('cancel_expired_reservations');

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

  // Get the wishlist with items and reservation status
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('*, items:wishlist_items(*, currency:currencies(code), reservations(status, created_at, reservation_code, expires_at))')
    .eq('id', shareLink.wishlist_id)
    .single();

  if (wishlistError) {
    throw wishlistError;
  }

  // Transform to get the most recent reservation status for each item
  const statusOrder = { available: 0, reserved: 1, purchased: 2, cancelled: 3 };
  
  const transformedItems = wishlist.items.map((item) => {
    // Sort reservations by created_at descending
    const sortedReservations = item.reservations?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Filter out expired reservations (belt and suspenders approach)
    const activeReservations = sortedReservations?.filter(r => 
      r.status !== 'reserved' || new Date(r.expires_at) >= new Date()
    );
    
    const latestReservation = activeReservations?.[0];
    
    // Check if the user has reserved this item (matching reservation code)
    const userReservation = reservationCode 
      ? activeReservations?.find(r => r.reservation_code === reservationCode && r.status === 'reserved')
      : null;
    
    return {
      ...item,
      status: latestReservation?.status ?? 'available',
      userHasReserved: !!userReservation,
      userReservationCode: userReservation?.reservation_code,
      reservations: undefined, // Remove the reservations array from the final object
    };
  });

  // Sort items by status: available first, reserved second, purchased last
  const sortedItems = transformedItems.sort((a, b) => {
    const statusA = a.status as keyof typeof statusOrder;
    const statusB = b.status as keyof typeof statusOrder;
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return {
    ...wishlist,
    items: sortedItems,
  };
}

