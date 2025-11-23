import { supabase } from '@/supabaseClient'
import type { Tables } from '@/database.types'

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

export interface UserDataExport {
  user: {
    id: string
    email: string | undefined
    created_at: string
  }
  wishlists: Tables<'wishlists'>[]
  wishlist_items: Tables<'wishlist_items'>[]
  reservations: Tables<'reservations'>[]
  share_links: Tables<'share_links'>[]
  permissions: Tables<'wishlist_permissions'>[]
  exported_at: string
}

/**
 * Prepare user data export for GDPR compliance
 * This function is DOM-free and can be tested in non-browser environments
 */
export async function prepareUserDataExport(): Promise<UserDataExport> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    throw new Error(`Authentication error: ${authError.message}`)
  }
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch all user data with proper error handling
  const [
    wishlistsResponse,
    itemsResponse,
    reservationsResponse,
    shareLinksResponse,
    permissionsResponse,
  ] = await Promise.all([
    supabase.from('wishlists').select('*').eq('author_id', user.id),
    supabase.from('wishlist_items').select('*').eq('author_id', user.id),
    supabase.from('reservations').select('*').eq('user_id', user.id),
    supabase.from('share_links').select('*').eq('created_by', user.id),
    supabase.from('wishlist_permissions').select('*').eq('user_id', user.id),
  ])

  // Aggregate errors from all queries
  const errors: string[] = []
  
  if (wishlistsResponse.error) {
    errors.push(`Wishlists: ${wishlistsResponse.error.message}`)
  }
  if (itemsResponse.error) {
    errors.push(`Wishlist items: ${itemsResponse.error.message}`)
  }
  if (reservationsResponse.error) {
    errors.push(`Reservations: ${reservationsResponse.error.message}`)
  }
  if (shareLinksResponse.error) {
    errors.push(`Share links: ${shareLinksResponse.error.message}`)
  }
  if (permissionsResponse.error) {
    errors.push(`Permissions: ${permissionsResponse.error.message}`)
  }

  // If any errors occurred, throw them
  if (errors.length > 0) {
    throw new Error(`Failed to fetch user data: ${errors.join('; ')}`)
  }

  const exportData: UserDataExport = {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    wishlists: wishlistsResponse.data || [],
    wishlist_items: itemsResponse.data || [],
    reservations: reservationsResponse.data || [],
    share_links: shareLinksResponse.data || [],
    permissions: permissionsResponse.data || [],
    exported_at: new Date().toISOString(),
  }

  return exportData
}

/**
 * Download user data export as a JSON file
 * Handles all DOM interactions for the download process
 */
export function downloadDataExport(exportData: UserDataExport): void {
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
}

/**
 * Export user data for GDPR compliance
 * Combines data preparation and download functionality
 */
export async function exportUserData(): Promise<UserDataExport> {
  const exportData = await prepareUserDataExport()
  downloadDataExport(exportData)
  return exportData
}

/**
 * Delete user account and all associated data
 * This calls a secure Edge Function to perform the deletion
 */
export async function deleteUserAccount() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error) {
    console.error('Error deleting account:', error)
    // Try to extract error message from the response data
    const errorMessage = (data as any)?.error || error.message || 'Failed to delete account'
    throw new Error(errorMessage)
  }

  // Sign out the user locally
  await supabase.auth.signOut()

  return data
}

