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
  if (!skipAuth) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required to get a wishlist');
    }
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      items:wishlist_items(*, currency:currencies(code), reservations(status, created_at))
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
    const latestReservation = sortedReservations?.[0];
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reservations, ...itemWithoutReservations } = item;

    return {
      ...itemWithoutReservations,
      status: latestReservation?.status ?? 'available',
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

