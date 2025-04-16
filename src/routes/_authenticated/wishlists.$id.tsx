import { motion } from 'motion/react'
import { List } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { getWishlist } from '@/services'
import { createFileRoute } from '@tanstack/react-router'
import { AddWishlistItem } from '@/components/AddWishlistItem/AddWishlistItem'
import { WishlistItemCard } from '@/components/WishlistItemCard/WishlistItemCard'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authenticated/wishlists/$id')({
  params: {
    parse: (params) => {
      return {
        id: Number(params.id),
      }
    },
  },
  loader: async ({ params }: { params: { id: number } }) => {
    const wishlist = await getWishlist(params.id)
    return { wishlist }
  },
  component: WishlistDetailed,
})

function WishlistDetailed() {
  const { id: wishlistId } = Route.useParams()

  const { data: wishlist, isLoading, refetch } = useQuery({
    queryKey: ['wishlist', wishlistId],
    queryFn: () => getWishlist(wishlistId),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!wishlist) {
    return <div>Wishlist not found</div>
  }

  return (
    <Fragment>
      <div className='flex justify-between align-top mb-4'>
        <div>
          <h1 className='text-4xl font-medium'>{wishlist.name}</h1>
          <p className='text-2xl text-muted-foreground mt-2'>{wishlist.description}</p>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {wishlist.items.length > 0 && wishlist.items.map((item) => (
          <WishlistItemCard key={item.id} item={item} refetchItems={refetch} />
        ))}
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