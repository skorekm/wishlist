import { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, MoreHorizontal, TriangleAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { deleteWishlistItem } from "@/services"
import { EditWishlistItem } from "@/components/modules/EditWishlistItem/EditWishlistItem"
import { Badge } from "../../ui/badge"
import { getPriorityLabel } from "@/lib/utils"

interface WishlistItemCardProps {
  item: Database['public']['Tables']['wishlist_items']['Row'] & { currency: { code: string } }
  refetchItems?: () => void
}

const priorityColors: Record<string, string> = {
  low: "border-yellow-500 bg-yellow-500/20",
  medium: "border-orange-500 bg-orange-500/20",
  high: "border-red-500 bg-red-500/20",
};

export function WishlistItemCard({ item, refetchItems }: WishlistItemCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = () => {
    setIsDeleting(true);
    deleteWishlistItem(item.id).then(() => {
      refetchItems?.();
      setIsDeleting(false);
      setDeleteModal(false);
    });
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
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
                    className={`bg-secondary text-secondary-foreground hover:bg-secondary/80 ${priorityColors[item.priority.toLowerCase()] || ""}`}
                  >
                    {getPriorityLabel(item.priority)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditModal(true)} className="cursor-pointer">Edit Item</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild>
                      <DropdownMenuItem onClick={() => setDeleteModal(true)} className="cursor-pointer text-destructive">Delete Item</DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Dialog>
            </div>
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
      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TriangleAlert className="size-5 text-destructive mr-2" />
              <span>Delete Item</span>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete <strong>"{item.name}"</strong> from your wishlist? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button disabled={isDeleting} onClick={deleteItem} variant="default">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditWishlistItem
        item={item}
        isOpen={editModal}
        onOpenChange={setEditModal}
        onSuccess={() => refetchItems?.()}
      />
    </motion.div>
  )
}

