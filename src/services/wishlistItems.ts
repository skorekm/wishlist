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

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert(wishlistItem)
    .select()
    .single();
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
    .eq('id', id)
    .eq('author_id', user.id)
    .select()
    .single();
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

  // First, fetch the wishlist item to verify ownership
  const { data: wishlistItem, error: fetchError } = await supabase
    .from('wishlist_items')
    .select('author_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    // Handle "not found" case
    if (fetchError.code === 'PGRST116') {
      throw new Error('Wishlist item not found');
    }
    throw fetchError;
  }

  // Verify ownership
  if (wishlistItem.author_id !== user.id) {
    throw new Error('You are not authorized to delete this wishlist item');
  }

  // Perform the delete
  const { data, error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    throw error;
  }
  return data;
}

