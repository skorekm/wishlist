export const PERMISSIONS = {
  WISHLIST: {
    VIEW: 'wishlist:view',
    EDIT: 'wishlist:edit',
    DELETE: 'wishlist:delete',
    SHARE: 'wishlist:share',
  },
  WISHLIST_ITEM: {
    CREATE: 'wishlist_item:create',
    EDIT: 'wishlist_item:edit',
    DELETE: 'wishlist_item:delete',
  },
} as const;

// Extract all permission values as a union type
export type PermissionName = 
  | 'wishlist:view'
  | 'wishlist:edit'
  | 'wishlist:delete'
  | 'wishlist:share'
  | 'wishlist_item:create'
  | 'wishlist_item:edit'
  | 'wishlist_item:delete';

// Helper to get all permission values as an array
export const ALL_PERMISSIONS: PermissionName[] = [
  'wishlist:view',
  'wishlist:edit',
  'wishlist:delete',
  'wishlist:share',
  'wishlist_item:create',
  'wishlist_item:edit',
  'wishlist_item:delete',
];

