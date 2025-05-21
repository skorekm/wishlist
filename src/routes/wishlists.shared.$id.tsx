import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getWishlist } from '@/services'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/wishlists/shared/$id')({
  component: SharedWishlist,
})

function SharedWishlist() {
  const { id: wishlistId } = Route.useParams()
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['shared-wishlist', wishlistId],
    queryFn: () => getWishlist(wishlistId, true),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) return <div>Loading...</div>
  if (!wishlist) return <div>Wishlist not found</div>

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-medium">{wishlist.name}</h1>
          <p className="text-2xl text-muted-foreground mt-2">{wishlist.description}</p>
        </div>
        <Link to="/">
          <Button variant="outline">Sign in to create your own wishlist</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
