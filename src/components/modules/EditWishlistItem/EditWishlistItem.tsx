import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Database } from '@/database.types'
import { updateWishlistItem } from '@/services'
import { EditWishlistItemFormData, editWishlistItemSchema } from '../WishlistItemForm/wishlistItemSchema'
import { WishlistItemFormFields } from '../WishlistItemForm/WishlistItemFormFields'

interface EditWishlistItemProps {
  item: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'currency'> & { currency: { code: string } }
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  wishlistUuid: string
}

export function EditWishlistItem({ item, isOpen, onOpenChange, wishlistUuid }: EditWishlistItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const { 
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EditWishlistItemFormData>({
    resolver: zodResolver(editWishlistItemSchema),
    mode: 'onChange',
    defaultValues: {
      name: item.name,
      price: item.price,
      priority: item.priority,
      category: item.category || '',
      link: item.link,
      notes: item.notes,
    }
  })

  const onSubmit = async (data: EditWishlistItemFormData) => {
    setIsUpdating(true);
    try {
      await updateWishlistItem(item.id, data);
      
      // Close dialog first
      onOpenChange(false);
      
      // Update cache with server response after successful update
      queryClient.setQueryData<{ items: Array<{ id: number; currency: unknown; [key: string]: unknown }>; [key: string]: unknown }>(['wishlist', wishlistUuid], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map((i) => 
            i.id === item.id ? { ...i, ...data, currency: i.currency } : i
          )
        };
      });
      
      // Invalidate wishlists query to keep index page in sync
      await queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    } catch (error) {
      console.error('Error updating wishlist item', error)
    } finally {
      setIsUpdating(false);
    }
  }

  const closeDialog = () => {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit Wishlist Item</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update the details of your wishlist item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <WishlistItemFormFields
              control={control}
              register={register}
              errors={errors}
              showCurrency={false}
            />
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={!isValid || isSubmitting || isUpdating}>
              {isSubmitting || isUpdating ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 