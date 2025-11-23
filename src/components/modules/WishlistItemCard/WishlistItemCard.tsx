import { useState, useEffect, useMemo } from "react"
import { ExternalLink, MoreHorizontal, Gift, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { EditWishlistItem } from "@/components/modules/EditWishlistItem/EditWishlistItem"
import { getPriorityLabel, cn } from "@/lib/utils"
import { ReserveItem } from "../ReserveItem/ReserveItem"
import { DeleteItemDialog } from "./DeleteItemDialog"
import { MarkPurchasedDialog } from "./MarkPurchasedDialog"
import { VISIBLE_PRIORITIES, ITEM_STATUS } from "@/constants"
import { Link } from "@tanstack/react-router"

export interface WishlistItemPermissions {
  canEdit?: boolean
  canDelete?: boolean
  canGrab?: boolean
}

// Extracted complex type for better reusability
export type WishlistItemWithStatus = Omit<
  Database['public']['Tables']['wishlist_items']['Row'], 
  'currency'
> & {
  currency: { code: string }
  status?: 'available' | 'reserved' | 'purchased' | 'cancelled'
  userHasReserved?: boolean
  userReservationCode?: string
  expiresAt?: string
}

interface WishlistItemCardProps {
  item: WishlistItemWithStatus
  wishlistUuid: string
  permissions?: WishlistItemPermissions
  reservationCode?: string
  authenticatedUser?: { id: string; email?: string } | null
  wishlistContext?: {
    name: string
    id: string
  }
}

// Helper to safely parse URL hostname
const getUrlHostname = (url: string): string => {
  try {
    return new URL(url).hostname
  } catch {
    return 'View link'
  }
}

// Helper to get status border class
const getStatusBorderClass = (
  isReserved: boolean,
  isPurchased: boolean,
  itemStatus: string
): string => {
  if (isReserved) return 'border-l-amber-500 dark:border-l-amber-400'
  if (isPurchased) return 'border-l-emerald-500 dark:border-l-emerald-400'
  if (itemStatus === ITEM_STATUS.CANCELLED) return 'border-l-gray-400 dark:border-l-gray-500'
  return 'border-l-transparent'
}

// Helper to check if an item status allows reservation
const isReservableStatus = (status: string): boolean => {
  return status === ITEM_STATUS.AVAILABLE || status === ITEM_STATUS.CANCELLED
}

export function WishlistItemCard({ item, wishlistUuid, permissions = {}, reservationCode, authenticatedUser, wishlistContext }: WishlistItemCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [markPurchasedModal, setMarkPurchasedModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Secure by default: permissions default to false
  const { canEdit = false, canDelete = false, canGrab = false } = permissions

  // Show dropdown only if user has edit or delete permissions
  const showActions = canEdit || canDelete

  // Get status information
  const itemStatus = item.status || ITEM_STATUS.AVAILABLE
  const isAvailable = isReservableStatus(itemStatus)
  const isReserved = itemStatus === ITEM_STATUS.RESERVED
  const isPurchased = itemStatus === ITEM_STATUS.PURCHASED
  const isCancelled = itemStatus === ITEM_STATUS.CANCELLED

  // Check if user can mark as purchased
  const canMarkPurchased = item.userReservationCode && (item.userHasReserved || (reservationCode && reservationCode === item.userReservationCode)) && !isPurchased

  // Calculate time remaining for reservation
  useEffect(() => {
    if (!item.expiresAt || !isReserved) return

    const updateTimeRemaining = () => {
      if (!item.expiresAt) return
      
      const now = new Date()
      const expiresDate = new Date(item.expiresAt)
      const diff = expiresDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Expired')
        clearInterval(interval)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeRemaining(`${days}d ${hours % 24}h left`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m left`)
      } else {
        setTimeRemaining(`${minutes}m left`)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [item.expiresAt, isReserved])

  // Status border color - using helper function
  const statusBorderClass = getStatusBorderClass(isReserved, isPurchased, itemStatus)

  // State-based visual modifiers
  const stateClasses = isPurchased
    ? 'opacity-60 bg-emerald-50 dark:bg-emerald-950/10'
    : isReserved && !item.userHasReserved
    ? 'opacity-80'
    : ''

  const userReservedBg = item.userHasReserved
    ? 'bg-amber-50 dark:bg-amber-950/10'
    : ''

  // Memoized computed values
  const showPriority = useMemo(
    () => item.priority && (VISIBLE_PRIORITIES as readonly string[]).includes(item.priority),
    [item.priority]
  )

  const priorityClass = useMemo(() => {
    const priority = item.priority?.toLowerCase()
    if (priority === 'high') return 'text-red-600 dark:text-red-400'
    if (priority === 'medium') return 'text-orange-600 dark:text-orange-400'
    return ''
  }, [item.priority])

  return (
    <div className="h-full flex flex-col">
      <Card
        className={cn(
          "group relative flex-1 flex flex-col rounded-lg border border-border bg-card overflow-hidden",
          "transition-all duration-200 hover:border-foreground/20 hover:shadow-sm border-l-4",
          statusBorderClass,
          stateClasses,
          userReservedBg
        )}
      >
        <CardContent className="p-4 sm:p-3 flex flex-col h-full gap-2">
          {/* Header */}
          <div className="flex flex-col gap-1">
            {wishlistContext && (
              <Link 
                to="/wishlists/$id" 
                params={{ id: wishlistContext.id }}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors w-fit"
              >
                From <span className="font-medium text-foreground/80">{wishlistContext.name}</span>
              </Link>
            )}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-medium text-foreground leading-tight line-clamp-2 sm:line-clamp-1 flex-1">
                {item.name}
              </h3>
              
              {/* Actions - Only Kebab Menu here now */}
              <div className="flex items-center gap-1 sm:gap-0.5 -mt-0.5 -mr-1">
                {showActions && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        aria-label="More options"
                        className="h-8 w-8 sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setEditModal(true)} className="cursor-pointer text-sm">
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canEdit && canDelete && <DropdownMenuSeparator />}
                      {canDelete && (
                        <DropdownMenuItem onClick={() => setDeleteModal(true)} className="cursor-pointer text-destructive focus:text-destructive text-sm">
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 flex-wrap">
            {/* Price */}
            <span className="tabular-nums">
              {item.price.toFixed(2)} {item.currency.code}
            </span>
            
            {/* Category */}
            {item.category && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>{item.category}</span>
              </>
            )}
            
            {/* Priority (only medium/high) */}
            {showPriority && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className={cn(priorityClass, "font-medium")}>
                  {getPriorityLabel(item.priority)}
                </span>
              </>
            )}

            {/* Status text for reserved/purchased */}
            {isAvailable && !isCancelled && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-slate-500 dark:text-slate-400">Available</span>
              </>
            )}
            {isCancelled && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-gray-500 dark:text-gray-400">Cancelled</span>
              </>
            )}
            {isReserved && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {item.userHasReserved ? 'Reserved by you' : 'Reserved'}
                </span>
                {timeRemaining && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span aria-live="polite" aria-atomic="true">{timeRemaining}</span>
                  </>
                )}
              </>
            )}
            
            {isPurchased && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-emerald-600 dark:text-emerald-400">Purchased</span>
              </>
            )}
          </div>

          {/* Description/Notes */}
          {item.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {item.notes}
            </p>
          )}

          {/* External Link */}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-auto transition-colors w-fit"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              {getUrlHostname(item.link)}
            </a>
          )}
        </CardContent>

        {/* Footer Actions */}
        {(canGrab || canMarkPurchased) && (
          <div className="p-3 pt-0 mt-auto">
            {canMarkPurchased && (
              <Button
                className="w-full gap-2 shadow-sm"
                variant="default"
                onClick={() => setMarkPurchasedModal(true)}
              >
                <Check className="h-4 w-4" />
                Mark Purchased
              </Button>
            )}
            
            {canGrab && !canMarkPurchased && isAvailable && (
              <ReserveItem 
                item={item} 
                authenticatedUser={authenticatedUser}
                trigger={
                  <Button className="w-full gap-2 shadow-sm" variant="default">
                    <Gift className="h-4 w-4" />
                    Grab this item
                  </Button>
                }
              />
            )}
          </div>
        )}
      </Card>

      {canDelete && (
        <DeleteItemDialog
          itemId={item.id}
          itemName={item.name}
          wishlistUuid={wishlistUuid}
          isOpen={deleteModal}
          onOpenChange={setDeleteModal}
        />
      )}

      {canEdit && (
        <EditWishlistItem
          item={item}
          isOpen={editModal}
          onOpenChange={setEditModal}
          wishlistUuid={wishlistUuid}
        />
      )}

      {canMarkPurchased && item.userReservationCode && (
        <MarkPurchasedDialog
          itemName={item.name}
          reservationCode={item.userReservationCode}
          isOpen={markPurchasedModal}
          onOpenChange={setMarkPurchasedModal}
        />
      )}
    </div>
  )
}
