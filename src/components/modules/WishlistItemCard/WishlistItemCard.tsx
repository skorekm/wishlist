import { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, MoreHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { EditWishlistItem } from "@/components/modules/EditWishlistItem/EditWishlistItem"
import { getPriorityLabel } from "@/lib/utils"
import { Badge } from "../../ui/badge"
import { ReserveItem } from "../ReserveItem/ReserveItem"
import { DeleteItemDialog } from "./DeleteItemDialog"

export interface WishlistItemPermissions {
  canEdit?: boolean
  canDelete?: boolean
  canGrab?: boolean
}

interface WishlistItemCardProps {
  item: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'currency'> & { currency: { code: string } }
  wishlistUuid: string
  permissions?: WishlistItemPermissions
}

const priorityColors: Record<string, string> = {
  low: "border-yellow-500 bg-yellow-500/20",
  medium: "border-orange-500 bg-orange-500/20",
  high: "border-red-500 bg-red-500/20",
};

export function WishlistItemCard({ item, wishlistUuid, permissions = {} }: WishlistItemCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)

  // Secure by default: permissions default to false
  const { canEdit = false, canDelete = false, canGrab = false } = permissions

  // Show dropdown only if user has edit or delete permissions
  const showActions = canEdit || canDelete

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground h-full flex flex-col">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
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
              </div>
            </div>
            {canGrab && !showActions && (
              <ReserveItem item={item} />
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
    </motion.div>
  )
}

