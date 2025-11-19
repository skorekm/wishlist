import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { List } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { listItem, stagger } from '@/lib/motion'
import { AddList } from '@/components/modules/AddList/AddList'
import { WishlistCard } from '@/components/modules/WishlistCard/WishlistCard'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { getWishlists, getUserReservations } from '@/services'
import { Fragment } from 'react/jsx-runtime'
import { useState, useEffect } from 'react'
import { supabase } from '@/supabaseClient'

// the trailing slash is important
export const Route = createFileRoute('/_authenticated/wishlists/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    }
    loadUser()
  }, [])

  const { data: wishlists, isLoading, refetch } = useQuery({
    queryKey: ['wishlists'],
    queryFn: getWishlists,
    retry: false, // Disable retry to prevent loops
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: reservations, isLoading: isLoadingReservations } = useQuery({
    queryKey: ['user-reservations'],
    queryFn: getUserReservations,
    retry: false, // Disable retry to prevent loops
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <Fragment>
      {/* My Wishlists Section */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-medium dark:text-gray-100">My Wishlists</h1>
          <p className="text-muted-foreground mt-1">Manage and organize all your wishlists</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-500" />
            <Input
              placeholder="Search lists..."
              className="pl-9 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
          <AddList
            onSuccess={refetch}
          />
        </div>
      </div>
      {isLoading && <div>Loading...</div>}
      {!isLoading && wishlists && wishlists?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="contents"
          >
            <AnimatePresence mode="popLayout">
              {wishlists.map((list) => (
                <motion.div
                  key={list.id}
                  variants={listItem}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  layout
                >
                  <WishlistCard
                    list={list}
                    refetchWishlists={refetch}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
      {!isLoading && wishlists?.length === 0 && <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-xl"
      >
        <div className="p-4 rounded-full bg-secondary flex items-center justify-center mb-4">
          <List className="h-12 w-12 text-accent" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Ooops, no wishlists found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">Create a new wishlist to get started</p>
        <AddList
          onSuccess={refetch}
        />
      </motion.div>}

      {/* Reserved Items Section */}
      {reservations && reservations.length > 0 && (
        <>
          <div className="mt-12 mb-6">
            <h2 className="text-2xl md:text-3xl font-medium dark:text-gray-100">Items I'm Grabbing</h2>
            <p className="text-muted-foreground mt-1">Items you've reserved from shared wishlists</p>
          </div>

          {isLoadingReservations && <div>Loading...</div>}
          
          {!isLoadingReservations && reservations && reservations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="contents"
              >
                <AnimatePresence mode="popLayout">
                  {reservations.map((reservation) => {
                    const item = reservation.wishlist_item;
                    if (!item) return null;
                    
                    return (
                      <motion.div
                        key={reservation.id}
                        variants={listItem}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        layout
                      >
                        <div className="relative pt-3">
                          {item.wishlist && (
                            <Link 
                              to="/wishlists/shared/$id" 
                              params={{ id: item.wishlist.uuid }}
                              search={{ code: reservation.reservation_code }}
                              className="absolute top-0 left-2 z-10 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md hover:bg-primary/90 transition-colors inline-block"
                            >
                              {item.wishlist.name}
                            </Link>
                          )}
                          <WishlistItemCard
                            item={{
                              ...item,
                              status: reservation.status,
                              userHasReserved: true,
                              userReservationCode: reservation.reservation_code,
                              expiresAt: reservation.expires_at,
                            }}
                            wishlistUuid={item.wishlist?.uuid || ''}
                            permissions={{}}
                            reservationCode={reservation.reservation_code}
                            authenticatedUser={user ?? null}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </>
      )}
    </Fragment>
  )
}
