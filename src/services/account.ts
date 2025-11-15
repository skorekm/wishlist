import { supabase } from '@/supabaseClient'

export interface UserProfile {
  id: string
  email: string | undefined
  created_at: string
}

/**
 * Get current user profile information
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Error fetching user:', error)
    return null
  }

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at || new Date().toISOString(),
  }
}

/**
 * Get account statistics
 */
export async function getAccountStats() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get wishlists count
  const { count: wishlistsCount, error: wishlistsError } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  if (wishlistsError) {
    console.error('Error fetching wishlists count:', wishlistsError)
  }

  // Get wishlist items count
  const { count: itemsCount, error: itemsError } = await supabase
    .from('wishlist_items')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  if (itemsError) {
    console.error('Error fetching items count:', itemsError)
  }

  // Get reservations count (as reserver)
  const { count: reservationsCount, error: reservationsError } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (reservationsError) {
    console.error('Error fetching reservations count:', reservationsError)
  }

  // Get share links count
  const { count: shareLinksCount, error: shareLinksError } = await supabase
    .from('share_links')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  if (shareLinksError) {
    console.error('Error fetching share links count:', shareLinksError)
  }

  return {
    wishlists: wishlistsCount || 0,
    items: itemsCount || 0,
    reservations: reservationsCount || 0,
    shareLinks: shareLinksCount || 0,
  }
}

/**
 * Export user data for GDPR compliance
 */
export async function exportUserData() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch all user data
  const [
    { data: wishlists },
    { data: items },
    { data: reservations },
    { data: shareLinks },
    { data: permissions },
  ] = await Promise.all([
    supabase.from('wishlists').select('*').eq('author_id', user.id),
    supabase.from('wishlist_items').select('*').eq('author_id', user.id),
    supabase.from('reservations').select('*').eq('user_id', user.id),
    supabase.from('share_links').select('*').eq('created_by', user.id),
    supabase.from('wishlist_permissions').select('*').eq('user_id', user.id),
  ])

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    wishlists: wishlists || [],
    wishlist_items: items || [],
    reservations: reservations || [],
    share_links: shareLinks || [],
    permissions: permissions || [],
    exported_at: new Date().toISOString(),
  }

  // Create a downloadable JSON file
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `wishlist-data-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return exportData
}

/**
 * Delete user account and all associated data
 * This performs a complete cascade deletion as per GDPR requirements
 * 
 * The delete_user() database function deletes the user from auth.users,
 * which triggers CASCADE deletion of:
 * - wishlists (ON DELETE CASCADE)
 * - wishlist_items (via wishlist_id FK with CASCADE)
 * - share_links (via wishlist_id and created_by FK with CASCADE)
 * - wishlist_permissions (via user_id and created_by FK with CASCADE)
 * 
 * Reservations are handled separately as they use SET NULL instead of CASCADE
 * to preserve anonymized records for wishlist owners.
 */
export async function deleteUserAccount() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Step 1: Anonymize reservations (SET NULL on user_id)
  // We keep reserver_name and reserver_email for wishlist owner's benefit
  // but break the link to the authenticated user account
  const { error: reservationsError } = await supabase
    .from('reservations')
    .update({ user_id: null })
    .eq('user_id', user.id)

  if (reservationsError) {
    console.error('Error anonymizing reservations:', reservationsError)
    throw new Error('Failed to anonymize reservations')
  }

  // Step 2: Delete the user account from Supabase Auth
  // This will CASCADE delete all other data via database constraints
  const { error: deleteUserError } = await supabase.rpc('delete_user')

  if (deleteUserError) {
    console.error('Error deleting user account:', deleteUserError)
    throw new Error('Failed to delete account. Please contact support.')
  }

  // Sign out the user
  await supabase.auth.signOut()

  return { success: true }
}

