import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getWishlistByShareToken } from '@/services'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { listItem, stagger } from '@/lib/motion'
import { Gift, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/wishlists/shared/$id')({
  component: SharedWishlist,
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

function SharedWishlist() {
  const { id: shareToken } = Route.useParams()
  const { data: wishlist, isLoading, error } = useQuery({
    queryKey: ['shared-wishlist', shareToken],
    queryFn: () => getWishlistByShareToken(shareToken),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !wishlist) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-medium mb-2">Wishlist Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            This wishlist link is invalid or has been revoked. Please check with the person who shared it.
          </p>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const eventBadge = getEventBadgeVariant(wishlist.event_date);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-medium">{wishlist.name}</h1>
            {wishlist.event_date && eventBadge.text && (
              <Badge variant={eventBadge.variant} className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {eventBadge.text}
              </Badge>
            )}
          </div>
          {wishlist.description && (
            <p className="text-2xl text-muted-foreground mt-2">{wishlist.description}</p>
          )}
        </div>
        <Link to="/">
          <Button variant="outline">Create your own wishlist</Button>
        </Link>
      </div>
      
      {wishlist.items && wishlist.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="contents"
          >
            <AnimatePresence mode="popLayout">
              {wishlist.items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={listItem}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  layout
                >
                  <WishlistItemCard key={item.id} item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 px-4 text-center bg-card rounded-xl"
        >
          <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-accent" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">This wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md">The owner hasn't added any items yet. Check back later!</p>
        </motion.div>
      )}
    </div>
  )
}
