import { Fragment } from 'react/jsx-runtime'
import { getWishlist } from '@/services'
import { createFileRoute } from '@tanstack/react-router'
import { AddWishlistItem } from '@/components/AddWishlistItem/AddWishlistItem'
import { WishlistItemCard } from '@/components/WishlistItemCard/WishlistItemCard'

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
  const { wishlist } = Route.useLoaderData();
  console.log(wishlist)
  return (
    <Fragment>
      <div className='flex justify-between align-top'>
        <div>
          <h1 className='text-4xl font-medium'>{wishlist.name}</h1>
          <p className='text-2xl text-muted-foreground mt-2'>{wishlist.description}</p>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {wishlist.items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
      <AddWishlistItem onSuccess={() => {}} wishlistId={wishlist.id} />
    </Fragment>
  )
}