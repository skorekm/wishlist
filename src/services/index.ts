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

const POPULAR_CURRENCY_CODES = [
  'PLN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
  'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'ZAR', 'TRY', 'BRL',
  'INR', 'KRW'
];

export async function getCurrencies() {
  const { data, error } = await supabase
    .from('currencies')
    .select('id, code, currency')
    .is('withdrawal_date', null)
    .order('code');
  
  if (error) {
    throw error;
  }
  
  const seen = new Set<string>();
  const uniqueCurrencies = data.filter(currency => {
    if (seen.has(currency.code)) {
      return false;
    }
    seen.add(currency.code);
    return true;
  });
  
  const currencyOptions = uniqueCurrencies.map((currency) => ({
    value: String(currency.id),
    label: `${currency.code} (${currency.currency})`,
    code: currency.code,
    isPopular: POPULAR_CURRENCY_CODES.includes(currency.code)
  }));

  return currencyOptions.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.code.localeCompare(b.code);
  });
}

// Share link management functions

export async function generateShareLink(wishlistId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to generate a share link');
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

export async function revokeShareLink(shareTokenOrId: string | number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to revoke a share link');
  }

  const isToken = typeof shareTokenOrId === 'string';
  const query = supabase
    .from('share_links')
    .update({ revoked_at: new Date().toISOString() });

  if (isToken) {
    query.eq('share_token', shareTokenOrId);
  } else {
    query.eq('id', shareTokenOrId);
  }

  const { data, error } = await query.select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWishlistByShareToken(shareToken: string) {
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

  // Update last_accessed_at
  await supabase
    .from('share_links')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('share_token', shareToken);

  // Get the wishlist with items
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlists')
    .select('*, items:wishlist_items(*, currency:currencies(code))')
    .eq('id', shareLink.wishlist_id)
    .single();

  if (wishlistError) {
    throw wishlistError;
  }

  return wishlist;
}
