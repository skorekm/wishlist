import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";

export async function getWishlists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to get wishlists');
  }

  const { data, error } = await supabase.from('wishlists').select('*, items:wishlist_items(count)').eq('author_id', user.id);
  if (error) {
    throw error;
  }
  const wishlists = data.map((wishlist) => ({
    ...wishlist,
    items: wishlist.items?.[0]?.count ?? 0,
  }));

  return wishlists;
}

export async function getWishlist(id: string, skipAuth = false) {
  let userId: string | undefined;

  if (!skipAuth) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required to get a wishlist');
    }
    userId = user.id;
  } else {
    // Try to get user anyway if available, for reservation checking
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  // Clean up expired reservations before fetching
  await supabase.rpc('cancel_expired_reservations');

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      items:wishlist_items(*, currency:currencies(code), reservations(status, created_at, expires_at, user_id, reservation_code))
    `)
    .eq('uuid', id)
    .single();

  if (error) {
    throw error;
  }

  // Transform to get the most recent reservation status for each item
  const statusOrder = { available: 0, reserved: 1, purchased: 2, cancelled: 3 };
  
  const transformedItems = (data.items ?? []).map((item) => {
    // Sort reservations by created_at descending and get the most recent one
    const sortedReservations = item.reservations?.slice().sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Filter out expired reservations (belt and suspenders approach)
    const activeReservations = sortedReservations?.filter(r => 
      r.status !== 'reserved' || new Date(r.expires_at) >= new Date()
    );
    
    const latestReservation = activeReservations?.[0];
    
    // Check if the current user has reserved this item
    const userReservation = userId 
      ? activeReservations?.find(r => r.user_id === userId && r.status === 'reserved')
      : null;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reservations, ...itemWithoutReservations } = item;

    return {
      ...itemWithoutReservations,
      status: latestReservation?.status ?? 'available',
      userHasReserved: !!userReservation,
      userReservationCode: userReservation?.reservation_code,
      expiresAt: userReservation?.expires_at || latestReservation?.expires_at,
    };
  });

  // Sort items by status: available first, reserved second, purchased last
  const sortedItems = transformedItems.sort((a, b) => {
    const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
    return statusA - statusB;
  });

  return {
    ...data,
    items: sortedItems,
  };
}

export async function createWishlist(list: Omit<Database['public']['Tables']['wishlists']['Insert'], 'author_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create a wishlist');
  }

  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      ...list,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function updateWishlist(id: number, list: Database['public']['Tables']['wishlists']['Update']) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to update a wishlist');
  }

  const { data, error } = await supabase
    .from('wishlists')
    .update(list)
    .eq('id', id)
    .eq('author_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function deleteWishlist(id: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to delete a wishlist');
  }

  const { data, error } = await supabase.from('wishlists').delete().eq('id', id).eq('author_id', user.id);
  if (error) {
    throw error;
  }
  return data;
}

