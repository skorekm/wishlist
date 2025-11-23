import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { markItemAsPurchased } from "@/services/reservations"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface MarkPurchasedDialogProps {
  itemName: string
  reservationCode: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkPurchasedDialog({ 
  itemName, 
  reservationCode, 
  isOpen, 
  onOpenChange 
}: MarkPurchasedDialogProps) {
  const queryClient = useQueryClient()

  const markPurchasedMutation = useMutation({
    mutationFn: async () => {
      return markItemAsPurchased(reservationCode)
    },
    onSuccess: () => {
      toast.success('Item marked as purchased! 🎉')
      onOpenChange(false)
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['shared-wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] })
    },
    onError: (error) => {
      toast.error('Failed to mark item as purchased')
      console.error('Error marking item as purchased:', error)
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Are you sure you've purchased <strong>{itemName}</strong>? This action will mark the item as purchased.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={markPurchasedMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => markPurchasedMutation.mutate()}
            disabled={markPurchasedMutation.isPending}
          >
            {markPurchasedMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

