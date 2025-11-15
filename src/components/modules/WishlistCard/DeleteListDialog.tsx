import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { toast } from 'sonner'
import { deleteWishlist } from "@/services"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteListDialogProps {
  wishlistId: number
  wishlistName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteListDialog({ 
  wishlistId, 
  wishlistName, 
  isOpen, 
  onOpenChange,
  onSuccess 
}: DeleteListDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)
    deleteWishlist(wishlistId)
      .then(() => {
        onSuccess()
        toast.success("Wishlist deleted successfully!")
      })
      .catch((error) => {
        console.error('Error deleting wishlist', error)
        toast.error("Failed to delete wishlist. Please try again.")
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
            <span>Delete List</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete <strong>"{wishlistName}"</strong>? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

