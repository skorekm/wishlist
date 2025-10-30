import { AnimatePresence, motion } from 'motion/react'
import { List, Calendar, Share2 } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
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
  const { id: wishlistId } = Route.useParams()
  const [shareModal, setShareModal] = useState(false)

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist', wishlistId],
    queryFn: () => getWishlist(wishlistId),
    retry: 2,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!wishlist) {
    return <div>Wishlist not found</div>
  }

  const eventStatus = getEventStatus(wishlist.event_date);

  return (
    <Fragment>
      <div className='flex justify-between align-top mb-4'>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className='text-4xl font-medium'>{wishlist.name}</h1>
            {eventStatus && (
              <div className={`flex items-center gap-1.5 text-sm ${eventStatus.color}`}>
                <Calendar className="h-3.5 w-3.5" />
                <span>{eventStatus.text}</span>
              </div>
            )}
          </div>
          <p className='text-2xl text-muted-foreground mt-2'>{wishlist.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShareModal(true)}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
              <WishlistItemCard item={item} wishlistUuid={wishlistId} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {wishlist.items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 px-4 text-center bg-card rounded-xl"
        >
          <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
            <List className="h-12 w-12 text-accent" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md">Add items to your wishlist so friends and family know what you'd love to receive.</p>
        </motion.div>
      )}
      <AddWishlistItem wishlistId={wishlist.id} wishlistUuid={wishlistId} />
      <ShareListDialog
        wishlistId={wishlist.id}
        isOpen={shareModal}
        onOpenChange={setShareModal}
      />
    </Fragment>
  )
}