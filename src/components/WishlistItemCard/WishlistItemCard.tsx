import { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink, MoreHorizontal, TriangleAlert } from "lucide-react"
import { Card, CardContent} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Database } from "@/database.types"
import { deleteWishlistItem } from "@/services"
import { EditWishlistItem } from "@/components/EditWishlistItem/EditWishlistItem"

interface WishlistItemCardProps {
  item: Database['public']['Tables']['wishlist_items']['Row']
  refetchItems: () => void
}

export function WishlistItemCard({ item, refetchItems }: WishlistItemCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = () => {
    setIsDeleting(true);
    deleteWishlistItem(item.id).then(() => {
      refetchItems();
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
            <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
            <div className="flex items-start">
              <span className="font-medium text-foreground mr-2">{item.price.toFixed(2)}</span>
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
          {/* <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {tag}
              </Badge>
            ))}
          </div> */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.notes}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-4" />
              {new URL(item.link).hostname}
            </a>
          )}
          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
            <Badge variant="outline" className="text-xs font-normal bg-transparent">
              {item.priority}
            </Badge>
            {item.purchased && (
              <Badge variant="outline" className="text-xs font-normal bg-transparent text-green-600 border-green-200">
                Purchased
              </Badge>
            )}
          </div> */}
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
        onSuccess={refetchItems} 
      />
    </motion.div>
  )
}

