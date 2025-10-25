import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";

export async function createWishlistItem(item: Omit<Database['public']['Tables']['wishlist_items']['Insert'], 'author_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create a wishlist item');
  }

  const wishlistItem = {
    ...item,
    author_id: user.id,
  }

  const { data, error } = await supabase.from('wishlist_items').insert(wishlistItem);
  if (error) {
    throw error;
  }
  return data;
}

export async function updateWishlistItem(id: number, item: Database['public']['Tables']['wishlist_items']['Update']) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to update a wishlist item');
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .update(item)
    .eq('id', id);
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteWishlistItem(id: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to delete a wishlist item');
  }

  const { data, error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) {
    throw error;
  }
  return data;
}

