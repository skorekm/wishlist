import clsx from 'clsx'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getWishlistByShareToken } from '@/services'
import { WishlistItemCard } from '@/components/modules/WishlistItemCard/WishlistItemCard'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { listItem, stagger, fadeIn } from '@/lib/motion'
import { Gift, Calendar, GiftIcon, Settings } from 'lucide-react'
import { getEventStatus } from '@/lib/utils'
import { supabase } from '@/supabaseClient'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useWishlistPermissions } from '@/hooks/useWishlistPermissions'

export const Route = createFileRoute('/wishlists/shared/$id')({
  component: SharedWishlist,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: search?.code as string | undefined,
    }
  },
})

interface SharedWishlistNavbarProps {
  user: { id: string; email?: string } | null
  shareToken: string
  reservationCode?: string
  onLogout: () => void
}

function SharedWishlistNavbar({ user, shareToken, reservationCode, onLogout }: SharedWishlistNavbarProps) {
  const currentPath = `/wishlists/shared/${shareToken}${reservationCode ? `?code=${reservationCode}` : ''}`
  
  return (
    <nav className="bg-background border-b border-border py-3 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to={user ? "/wishlists" : "/"}>
          <motion.div
            className="flex items-center gap-2"
            variants={fadeIn("right")}
            initial="hidden"
            animate="show"
          >
            <GiftIcon className="size-5 text-accent" />
            <span className="font-medium dark:text-gray-100">Wishlist</span>
          </motion.div>
        </Link>
        <motion.div
          className="flex items-center gap-3"
          variants={fadeIn("left")}
          initial="hidden"
          animate="show"
        >
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/settings">
                <Button variant="ghost" size="icon" title="Account Settings">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={onLogout} variant="outline">Logout</Button>
            </>
          ) : (
            <Link to="/login" search={{ redirect: currentPath }}>
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </motion.div>
      </div>
    </nav>
  )
}

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

  return (
    <>
      <SharedWishlistNavbar 
        user={user} 
        shareToken={shareToken} 
        reservationCode={reservationCode}
        onLogout={handleLogout}
      />
      
      {isLoading && (
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {(error || !wishlist) && !isLoading && (
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
      )}

      {wishlist && !isLoading && !error && (
        <WishlistContent 
          wishlist={wishlist}
          isOwner={isOwner}
          reservationCode={reservationCode}
          user={user}
        />
      )}
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
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-medium">{wishlist.name}</h1>
            {eventStatus && (
              <div className={clsx('flex items-center gap-1.5 text-sm', eventStatus.color)}>
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
