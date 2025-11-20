import { useState, useCallback } from "react"
import { Link } from "@tanstack/react-router"
import { MoreHorizontal, Share2 } from "lucide-react"
import { Database } from "@/database.types"
import { getEventStatus, cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditList } from "@/components/modules/EditList/EditList"
import { ShareListDialog } from "./ShareListDialog"
import { DeleteListDialog } from "./DeleteListDialog"

type WishlistCard = Database['public']['Tables']['wishlists']['Row'] & {
  items: number
}

interface WishlistCardProps {
  list: WishlistCard
  refetchWishlists: () => void
}

export function WishlistCard({ list, refetchWishlists }: WishlistCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [shareModal, setShareModal] = useState(false)
  
  const eventStatus = getEventStatus(list.event_date)
  
  // Mock progress data - replace with actual data when available
  const claimedItems = 0

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Refactored modal handlers using a factory function
  const createModalHandler = useCallback(
    (setter: (value: boolean) => void) => (e: React.MouseEvent) => {
      handleDropdownClick(e)
      setter(true)
    },
    []
  )

  const openEditModal = createModalHandler(setEditModal)
  const openShareModal = createModalHandler(setShareModal)
  const openDeleteModal = createModalHandler(setDeleteModal)

  // Determine status accent color for left border
  const isToday = eventStatus?.status === 'today'
  const isSoon = eventStatus?.status === 'soon'
  
  // Status border color classes
  const statusBorderClass = isToday 
    ? 'border-l-red-500 dark:border-l-red-400' 
    : isSoon 
    ? 'border-l-orange-500 dark:border-l-orange-400'
    : 'border-l-transparent'

  // Event text color classes - extracted for clarity
  const eventTextClass = cn(
    'tabular-nums',
    isToday && 'text-red-600 dark:text-red-400 font-medium',
    isSoon && 'text-orange-600 dark:text-orange-400 font-medium'
  )

  return (
    <div className="h-full">
      <Link
        to="/wishlists/$id"
        params={{ id: list.uuid }}
        className="block h-full"
        aria-label={`View ${list.name} wishlist`}
      >
        <Card
          className={cn(
            "group relative h-full flex flex-col p-3 rounded-lg border border-border bg-card",
            "transition-all duration-200 hover:border-foreground/20 hover:shadow-sm border-l-4",
            statusBorderClass
          )}
        >
          <div className="flex flex-col h-full gap-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              {/* Title */}
              <h3 className="text-lg font-medium text-foreground tracking-tight leading-tight line-clamp-1 flex-1">
                {list.name}
              </h3>
              
              {/* Actions */}
              <div className="flex items-center gap-0.5 -mt-0.5 -mr-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={openShareModal}
                  aria-label="Share wishlist"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                >
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      aria-label="More options"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={openEditModal} className="cursor-pointer text-sm">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openShareModal} className="cursor-pointer text-sm">
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openDeleteModal} className="cursor-pointer text-destructive focus:text-destructive text-sm">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {list.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {list.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-1.5 mt-auto text-xs text-muted-foreground/70">
              {/* Item count */}
              <span className="tabular-nums">
                {claimedItems > 0 ? `${claimedItems} of ${list.items}` : list.items} 
                {' '}{list.items === 1 ? 'item' : 'items'}
              </span>
              
              {/* Separator + Event date */}
              {eventStatus && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className={eventTextClass}>
                    {eventStatus.text}
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>
      </Link>
      
      <DeleteListDialog
        wishlistId={list.id}
        wishlistName={list.name}
        isOpen={deleteModal}
        onOpenChange={setDeleteModal}
        onSuccess={refetchWishlists}
      />
      
      <EditList 
        list={list} 
        isOpen={editModal} 
        onOpenChange={setEditModal} 
        onSuccess={refetchWishlists} 
      />
      
      <ShareListDialog
        wishlistId={list.id}
        isOpen={shareModal}
        onOpenChange={setShareModal}
      />
    </div>
  )
}
