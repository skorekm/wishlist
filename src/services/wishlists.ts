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
    items: wishlist.items[0].count,
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

  const { data, error } = await supabase.from('wishlists').select('*, items:wishlist_items(*, currency:currencies(code))').eq('uuid', id).single()
  if (error) {
    throw error;
  }
  return data;
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
    .eq('id', id);
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

