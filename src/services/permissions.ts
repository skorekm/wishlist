import { supabase } from '@/supabaseClient';
import type { PermissionName } from '@/constants/permissions';
import type { QueryClient } from '@tanstack/react-query';

export interface WishlistPermissions {
  permissions: PermissionName[];
  isOwner: boolean;
  canPerformAction: (action: PermissionName) => boolean;
}

export async function getUserPermissionsForWishlist(
  wishlistId: number,
  authorId: string
): Promise<WishlistPermissions> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      permissions: [],
      isOwner: false,
      canPerformAction: () => false,
    };
  }

  const isOwner = user.id === authorId;

  // Owners have all permissions
  if (isOwner) {
    return {
      permissions: [],
      isOwner: true,
      canPerformAction: () => true,
    };
  }

  // Fetch user's specific permissions for this wishlist
  const { data, error } = await supabase
    .from('wishlist_permissions')
    .select('permissions:permission_id(name)')
    .eq('wishlist_id', wishlistId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching permissions:', error);
    return {
      permissions: [],
      isOwner: false,
      canPerformAction: () => false,
    };
  }

  // TODO: Handle permissions that are not in the permissions table
  const permissions = (data || [])
    .map((row) => row.permissions?.name)
    .filter(Boolean) as PermissionName[];

  return {
    permissions,
    isOwner,
    canPerformAction: (action: PermissionName) => permissions.includes(action),
  };
}

/**
 * Invalidates permission cache for a specific wishlist
 * Call this after granting/revoking permissions
 */
export function invalidatePermissionsCache(
  queryClient: QueryClient,
  wishlistId: number,
  userId?: string
) {
  return queryClient.invalidateQueries({
    queryKey: ['wishlistPermissions', wishlistId, userId],
  });
}
