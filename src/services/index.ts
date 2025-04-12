import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";

export async function getWishlists() {
  const { data, error } = await supabase.from('wishlists').select('*, item_count:wishlists_items(count)');
  if (error) {
    throw error;
  }
  return data;
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
  // TODO: Include items in the wishlist
  const { data, error } = await supabase.from('wishlists').select('*, items:wishlists_items(*)').eq('id', id).single()
  if (error) {
    throw error;
  }
  return data;
}

export async function createWishlistItem(item: Database['public']['Tables']['wishlists_items']['Insert']) {
  const { data, error } = await supabase.from('wishlists_items').insert(item);
  if (error) {
    throw error;
  }
  return data;
}
