import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { deleteWishlistItem } from "@/services"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteItemDialogProps {
  itemId: number
  itemName: string
  wishlistUuid: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteItemDialog({ 
  itemId, 
  itemName, 
  wishlistUuid,
  isOpen, 
  onOpenChange 
}: DeleteItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleDelete = () => {
    setIsDeleting(true)
    deleteWishlistItem(itemId)
      .then(() => {
        // Optimistically update the cache immediately
        queryClient.setQueryData<{ items: Array<{ id: number }>; [key: string]: unknown }>(
          ['wishlist', wishlistUuid], 
          (oldData) => {
            if (!oldData) return oldData
            
            return {
              ...oldData,
              items: oldData.items.filter((i) => i.id !== itemId)
            }
          }
        )
        
        // Invalidate wishlists query to update item count on index page
        queryClient.invalidateQueries({ queryKey: ['wishlists'] })
        toast.success("Wishlist item deleted successfully!")
      })
      .catch((error) => {
        console.error('Error deleting wishlist item', error)
        toast.error("Failed to delete wishlist item. Please try again.")
      })
      .finally(() => {
        setIsDeleting(false)
        onOpenChange(false)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TriangleAlert className="size-5 text-destructive mr-2" />
            <span>Delete Item</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete <strong>"{itemName}"</strong> from your wishlist? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isDeleting} onClick={handleDelete} variant="default">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

