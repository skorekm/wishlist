import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";

export async function getWishlists() {
  const { data, error } = await supabase.from('wishlists').select('*');
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
