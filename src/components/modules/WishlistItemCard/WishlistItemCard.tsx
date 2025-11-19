import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { ExternalLink, MoreHorizontal, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { EditWishlistItem } from "@/components/modules/EditWishlistItem/EditWishlistItem"
import { getPriorityLabel } from "@/lib/utils"
import { Badge } from "../../ui/badge"
import { ReserveItem } from "../ReserveItem/ReserveItem"
import { DeleteItemDialog } from "./DeleteItemDialog"
import { MarkPurchasedDialog } from "./MarkPurchasedDialog"

export interface WishlistItemPermissions {
  canEdit?: boolean
  canDelete?: boolean
  canGrab?: boolean
}

interface WishlistItemCardProps {
  item: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'currency'> & {
    currency: { code: string }
    status?: 'available' | 'reserved' | 'purchased' | 'cancelled'
    userHasReserved?: boolean
    userReservationCode?: string
    expiresAt?: string
  }
  wishlistUuid: string
  permissions?: WishlistItemPermissions
  reservationCode?: string
  authenticatedUser?: { id: string; email?: string } | null
}

const priorityColors: Record<string, string> = {
  low: "border-yellow-500 bg-yellow-500/20",
  medium: "border-orange-500 bg-orange-500/20",
  high: "border-red-500 bg-red-500/20",
};

const statusConfig = {
  available: {
    label: "Available",
    badgeColor: "border-green-500 bg-green-500/20 text-green-700 dark:text-green-400",
  },
  reserved: {
    label: "Reserved",
    badgeColor: "border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-400",
  },
  purchased: {
    label: "Purchased",
    badgeColor: "border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-400",
  },
  cancelled: {
    label: "Cancelled",
    badgeColor: "border-gray-500 bg-gray-500/20 text-gray-700 dark:text-gray-400",
  }
};

export function WishlistItemCard({ item, wishlistUuid, permissions = {}, reservationCode, authenticatedUser }: WishlistItemCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [markPurchasedModal, setMarkPurchasedModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Secure by default: permissions default to false
  const { canEdit = false, canDelete = false, canGrab = false } = permissions

  // Show dropdown only if user has edit or delete permissions
  const showActions = canEdit || canDelete

  // Get status configuration
  const itemStatus = item.status || 'available'
  const statusInfo = statusConfig[itemStatus]
  const isAvailable = itemStatus === 'available'

  // Check if user can mark as purchased
  const canMarkPurchased = item.userHasReserved && item.userReservationCode && reservationCode === item.userReservationCode && itemStatus !== 'purchased'

  // Calculate time remaining for reservation
  useEffect(() => {
    if (!item.expiresAt || itemStatus !== 'reserved') return

    const updateTimeRemaining = () => {
      const now = new Date()
      const expiresDate = new Date(item.expiresAt!)
      const diff = expiresDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeRemaining(`${days}d ${hours % 24}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [item.expiresAt, itemStatus])

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground h-full flex flex-col">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                <Badge
                  variant="outline"
                  className={`${statusInfo.badgeColor} shrink-0`}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="bg-transparent">{item.price.toFixed(2)} {item.currency.code}</Badge>
                {item.category && (
                  <Badge
                    key={item.category}
                    variant="outline"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {item.category}
                  </Badge>
                )}
                {item.priority && (
                  <Badge
                    key={item.priority}
                    variant="outline"
                    className={`bg-secondary text-secondary-foreground ${priorityColors[item.priority.toLowerCase()] || ""}`}
                  >
                    {getPriorityLabel(item.priority)}
                  </Badge>
                )}
                {timeRemaining && item.expiresAt && itemStatus === 'reserved' && (
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining}
                  </Badge>
                )}
              </div>
            </div>
            {canMarkPurchased && (
              <Button
                size="sm"
                onClick={() => setMarkPurchasedModal(true)}
                className="shrink-0"
              >
                Mark Purchased
              </Button>
            )}
            {canGrab && !showActions && !canMarkPurchased && isAvailable && (
              <ReserveItem item={item} authenticatedUser={authenticatedUser} />
            )}
            {showActions && (
              <div className="flex items-start">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setEditModal(true)} className="cursor-pointer">
                        Edit Item
                      </DropdownMenuItem>
                    )}
                    {canEdit && canDelete && <DropdownMenuSeparator />}
                    {canDelete && (
                      <DropdownMenuItem onClick={() => setDeleteModal(true)} className="cursor-pointer text-destructive">
                        Delete Item
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{item.notes}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-4" />
              {new URL(item.link).hostname}
            </a>
          )}
        </CardContent>
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
    </motion.div>
  )
}

