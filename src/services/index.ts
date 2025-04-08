import { supabase } from "@/supabaseClient";


export async function getWishlists() {
  const { data, error } = await supabase.from('wishlists').select('*');
  if (error) {
    throw error;
  }
  return data;
}

export async function createWishlist(list: any) {
  console.log('create list', list);
  const { data, error } = await supabase.from('wishlists').insert(list);
  if (error) {
    throw error;
  }
  return data;
}
