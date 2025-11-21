import { supabase } from "@/supabaseClient";

export interface ReservationData {
  id: number;
  wishlist_item_id: number;
  reserver_name: string;
  reserver_email: string;
  reservation_code: string;
  status: 'available' | 'reserved' | 'purchased' | 'cancelled';
  created_at: string;
  expires_at: string;
}

/**
 * Marks an item as purchased using a reservation code
 */
export async function markItemAsPurchased(reservationCode: string) {
  // First, verify the reservation exists and is in 'reserved' status
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('reservation_code', reservationCode)
    .eq('status', 'reserved')
    .single();

  if (fetchError || !reservation) {
    throw new Error('Reservation not found or already processed');
  }

  // Update the reservation status to 'purchased'
  const { data, error } = await supabase
    .from('reservations')
    .update({ status: 'purchased' })
    .eq('reservation_code', reservationCode)
    .eq('status', 'reserved') // Double check status hasn't changed
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Reservation not found or already processed');
    }
    throw error;
  }

  return data;
}

/**
 * Gets reservation details by reservation code
 */
export async function getReservationByCode(reservationCode: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('reservation_code', reservationCode)
    .single();

  if (error) {
    // Return null if not found instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as ReservationData;
}

/**
 * Gets all reservations for a specific reservation code across all items in a wishlist
 */
export async function getReservationsForCode(reservationCode: string, wishlistId: number) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, wishlist_item:wishlist_items!inner(wishlist_id)')
    .eq('reservation_code', reservationCode)
    .eq('wishlist_item.wishlist_id', wishlistId);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Gets all active reservations for the authenticated user
 */
export async function getUserReservations() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to get reservations');
  }

  // Clean up expired reservations before fetching
  await supabase.rpc('cancel_expired_reservations');

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      wishlist_item:wishlist_items(
        *,
        currency:currencies(code),
        wishlist:wishlists(id, uuid, name, author_id)
      )
    `)
    .eq('user_id', user.id)
    .in('status', ['reserved', 'purchased'])
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

