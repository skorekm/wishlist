import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Gift, Calendar } from 'lucide-react'
import { getWishlistByShareToken } from '@/services'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/modules/Navbar/Navbar'
import { listItem } from '@/lib/motion'
import { getEventStatus } from '@/lib/utils'
import { supabase } from '@/supabaseClient'
import { useWishlistPermissions } from '@/hooks/useWishlistPermissions'

export const Route = createFileRoute('/wishlists/shared/$id')({
  component: SharedWishlist,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: search?.code as string | undefined,
    }
  },
})

function SharedWishlist() {
  const { id: shareToken } = Route.useParams()
  const { code: reservationCode } = Route.useSearch()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const { data: wishlist, isLoading, error } = useQuery({
    queryKey: ['shared-wishlist', shareToken, reservationCode],
    queryFn: () => getWishlistByShareToken(shareToken, reservationCode),
    retry: 1,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Redirect to 404 if wishlist not found
  useEffect(() => {
    if (!isLoading && (error || !wishlist)) {
      throw notFound()
    }
  }, [isLoading, error, wishlist])

  // Use the permission system to check if the user is the owner
  const { isOwner } = useWishlistPermissions({
    wishlistId: wishlist?.id,
    authorId: wishlist?.author_id,
    enabled: !!wishlist && !!user,
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const loginRedirectPath = `/wishlists/shared/${shareToken}${reservationCode ? `?code=${reservationCode}` : ''}`

  return (
    <>
      <Navbar 
        user={user}
        onLogout={handleLogout}
        loginRedirect={loginRedirectPath}
        showBackButton={false}
      />
      
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {wishlist && !isLoading && !error && (
          <WishlistContent 
            wishlist={wishlist}
            isOwner={isOwner}
            reservationCode={reservationCode}
            user={user}
          />
        )}
      </main>
    </>
  )
}

type SharedWishlist = Awaited<ReturnType<typeof getWishlistByShareToken>>

interface WishlistContentProps {
  wishlist: SharedWishlist
  isOwner: boolean
  reservationCode?: string
  user: { id: string; email?: string } | null
}

function WishlistContent({ wishlist, isOwner, reservationCode, user }: WishlistContentProps) {
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
                  wishlistUuid={wishlist.uuid}
                  permissions={{ canGrab: !isOwner }}
                  reservationCode={reservationCode}
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
            <Gift className="h-12 w-12 text-accent" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">This wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md">
            The owner hasn't added any items yet. Check back later!
          </p>
        </motion.div>
      )}
    </>
  )
}
