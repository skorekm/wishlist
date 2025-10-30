import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import { getUserPermissionsForWishlist } from '@/services/permissions';
import type { PermissionName } from '@/constants/permissions';

interface UseWishlistPermissionsOptions {
  wishlistId?: number;
  authorId?: string;
  enabled?: boolean;
  realtimeSync?: boolean;
}

interface UseWishlistPermissionsReturn {
  permissions: PermissionName[];
  canPerformAction: (action: PermissionName) => boolean;
  isOwner: boolean;
  isLoading: boolean;
}

export function useWishlistPermissions({
  wishlistId,
  authorId,
  enabled = true,
}: UseWishlistPermissionsOptions): UseWishlistPermissionsReturn {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['wishlistPermissions', wishlistId, user?.id],
    queryFn: () => getUserPermissionsForWishlist(wishlistId!, authorId!),
    enabled: enabled && !!wishlistId && !!authorId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  return {
    permissions: data?.permissions ?? [],
    canPerformAction: data?.canPerformAction ?? (() => false),
    isOwner: data?.isOwner ?? false,
    isLoading,
  };
}

