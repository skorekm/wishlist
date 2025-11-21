import { supabase } from '@/supabaseClient'
import { AnimatePresence, motion } from 'motion/react'
import { List, Calendar, Share2 } from 'lucide-react'
import { useState } from 'react'
import { getWishlist } from '@/services'
import { createFileRoute } from '@tanstack/react-router'
import { AddWishlistItem } from '@/components/modules/AddWishlistItem/AddWishlistItem'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { ShareListDialog } from '@/components/modules/WishlistCard/ShareListDialog'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { listItem } from '@/lib/motion'
import { getEventStatus } from '@/lib/utils'
import { useWishlistPermissions } from '@/hooks/useWishlistPermissions'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/_authenticated/wishlists/$id')({
  params: {
    parse: (params) => {
      return {
        id: params.id,
      }
    },
  },
  loader: async ({ params }: { params: { id: string } }) => {
    const wishlist = await getWishlist(params.id)
    return { wishlist }
  },
  component: WishlistDetailed,
})

function WishlistDetailed() {
  const { id: wishlistUuid } = Route.useParams()

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: wishlist, isLoading: isLoadingWishlist, error: wishlistError } = useQuery({
    queryKey: ['wishlist', wishlistUuid],
    queryFn: () => getWishlist(wishlistUuid),
    retry: 2,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const { canPerformAction, isOwner, isLoading: isLoadingPermissions, error: permissionsError } = useWishlistPermissions({
    wishlistId: wishlist?.id,
    authorId: wishlist?.author_id,
  })

  const isLoading = isLoadingWishlist || isLoadingPermissions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (wishlistError || permissionsError || !wishlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
          <List className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-medium mb-2">Wishlist Not Found</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {wishlistError?.message || permissionsError?.message || 'This wishlist could not be loaded.'}
        </p>
      </div>
    )
  }

  // Permission checks using constants
  const canShare = canPerformAction(PERMISSIONS.WISHLIST.SHARE)
  const canAddItems = canPerformAction(PERMISSIONS.WISHLIST_ITEM.CREATE)
  const canEditItems = canPerformAction(PERMISSIONS.WISHLIST_ITEM.EDIT)
  const canDeleteItems = canPerformAction(PERMISSIONS.WISHLIST_ITEM.DELETE)
  const canGrab = !isOwner

  return (
    <WishlistContent
      wishlist={wishlist}
      wishlistUuid={wishlistUuid}
      isOwner={isOwner}
      user={user}
      permissions={{
        canShare,
        canAddItems,
        canEditItems,
        canDeleteItems,
        canGrab,
      }}
    />
  )
}

type Wishlist = Awaited<ReturnType<typeof getWishlist>>

interface WishlistContentProps {
  wishlist: Wishlist
  wishlistUuid: string
  isOwner: boolean
  user?: { id: string; email?: string } | null
  permissions: {
    canShare: boolean
    canAddItems: boolean
    canEditItems: boolean
    canDeleteItems: boolean
    canGrab: boolean
  }
}

function WishlistContent({ wishlist, wishlistUuid, isOwner, user, permissions }: WishlistContentProps) {
  const [shareModal, setShareModal] = useState(false)
  const eventStatus = getEventStatus(wishlist.event_date)

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-medium">{wishlist.name}</h1>
            {eventStatus && (
              <div className={`flex items-center gap-1.5 text-sm ${eventStatus.color}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{eventStatus.text}</span>
              </div>
            )}
            {isOwner && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                Owner
              </span>
            )}
          </div>
          {wishlist.description && (
            <p className="text-2xl text-muted-foreground mt-2">{wishlist.description}</p>
          )}
        </div>
        {permissions.canShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareModal(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      {wishlist.items && wishlist.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {wishlist.items.map((item) => (
              <motion.div
                key={item.id}
                variants={listItem}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                layout
              >
                <WishlistItemCard
                  item={item}
                  wishlistUuid={wishlistUuid}
                  permissions={{ 
                    canEdit: permissions.canEditItems, 
                    canDelete: permissions.canDeleteItems,
                    canGrab: permissions.canGrab 
                  }}
                  authenticatedUser={user}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 px-4 text-center bg-card rounded-xl"
        >
          <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
            <List className="h-12 w-12 text-accent" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md">
            Add items to your wishlist so friends and family know what you'd love to receive.
          </p>
        </motion.div>
      )}

      {permissions.canAddItems && (
        <AddWishlistItem wishlistId={wishlist.id} wishlistUuid={wishlistUuid} />
      )}

      {permissions.canShare && (
        <ShareListDialog
          wishlistId={wishlist.id}
          isOpen={shareModal}
          onOpenChange={setShareModal}
        />
      )}
    </>
  )
}