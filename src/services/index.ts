import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";

export async function getWishlists() {
  const { data, error } = await supabase.from('wishlists').select('*, items:wishlist_items(count)');
  if (error) {
    throw error;
  }
  const wishlists = data.map((wishlist) => ({
    ...wishlist,
    items: wishlist.items[0].count,
  }));

  return wishlists;
}

export async function createWishlist(list: Database['public']['Tables']['wishlists']['Insert']) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create a wishlist');
  }

  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      ...list,
      author_id: user.id,
    });

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

  const { data, error } = await supabase.from('wishlists').delete().eq('id', id)// .eq('author_id', user.id);
  if (error) {
    throw error;
  }
  return data;
}

export async function getWishlist(id: number) {
  const { data, error } = await supabase.from('wishlists').select('*, items:wishlist_items(*)').eq('id', id).single()
  if (error) {
    throw error;
  }
  return data;
}

export async function createWishlistItem(item: Database['public']['Tables']['wishlist_items']['Insert']) {
  const { data, error } = await supabase.from('wishlist_items').insert(item);
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteWishlistItem(id: number) {
  const { data, error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return data;
}

export async function updateWishlistItem(id: number, item: Database['public']['Tables']['wishlist_items']['Update']) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update(item)
    .eq('id', id);
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
    .eq('id', id);
  if (error) {
    throw error;
  }
  return data;
}
