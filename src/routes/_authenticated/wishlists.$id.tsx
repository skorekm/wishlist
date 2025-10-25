import { AnimatePresence, motion } from 'motion/react'
import { List, Calendar } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { getWishlist } from '@/services'
import { createFileRoute } from '@tanstack/react-router'
import { AddWishlistItem } from '@/components/modules/AddWishlistItem/AddWishlistItem'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { useQuery } from '@tanstack/react-query'
import { listItem, stagger } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
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

function getEventBadgeVariant(eventDate: string | null): { variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string } {
  if (!eventDate) return { variant: 'secondary', text: '' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  
  const diffTime = event.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { variant: 'secondary', text: 'Event passed' };
  } else if (diffDays === 0) {
    return { variant: 'default', text: 'Today!' };
  } else if (diffDays <= 7) {
    return { variant: 'destructive', text: `${diffDays} day${diffDays === 1 ? '' : 's'} left` };
  } else if (diffDays <= 30) {
    return { variant: 'default', text: `${diffDays} days left` };
  } else {
    return { variant: 'outline', text: event.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
  }
}

function WishlistDetailed() {
  const { id: wishlistId } = Route.useParams()

  const { data: wishlist, isLoading, refetch } = useQuery({
    queryKey: ['wishlist', wishlistId],
    queryFn: () => getWishlist(wishlistId),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!wishlist) {
    return <div>Wishlist not found</div>
  }

  const eventBadge = getEventBadgeVariant(wishlist.event_date);

  return (
    <Fragment>
      <div className='flex justify-between align-top mb-4'>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className='text-4xl font-medium'>{wishlist.name}</h1>
            {wishlist.event_date && eventBadge.text && (
              <Badge variant={eventBadge.variant} className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {eventBadge.text}
              </Badge>
            )}
          </div>
          <p className='text-2xl text-muted-foreground mt-2'>{wishlist.description}</p>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="contents"
        >
          <AnimatePresence mode="popLayout">
            {wishlist.items.length > 0 && wishlist.items.map((item) => (
              <motion.div
                key={item.id}
                variants={listItem}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                layout
              >
                <WishlistItemCard key={item.id} item={item} refetchItems={refetch} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
      <AddWishlistItem onSuccess={refetch} wishlistId={wishlist.id} />
    </Fragment>
  )
}