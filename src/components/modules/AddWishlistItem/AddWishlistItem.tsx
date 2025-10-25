import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Database } from '@/database.types'
import { createWishlistItem, getCurrencies } from '@/services'
import { PRIORITY_OPTIONS } from '@/constants'
import { AddWishlistItemFormData, addWishlistItemSchema } from '../WishlistItemForm/wishlistItemSchema'
import { WishlistItemFormFields } from '../WishlistItemForm/WishlistItemFormFields'

export function AddWishlistItem({ wishlistId, wishlistUuid, isOpen = false }: { wishlistId: number, wishlistUuid: string, isOpen?: boolean }) {
  const [open, setOpen] = useState(isOpen);
  const queryClient = useQueryClient();

  const { data: currency, isLoading } = useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies
  });

  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddWishlistItemFormData>({
    resolver: zodResolver(addWishlistItemSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      priority: PRIORITY_OPTIONS[1].value as Database["public"]["Enums"]["priority"],
      category: '',
      link: null,
      notes: null,
    }
  })

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: number) => void) => {
    const parsedValue = Number(e.target.value);
    if (isNaN(parsedValue)) {
      return;
    }
    onChange(parsedValue);
  }

  const onSubmit = async (data: AddWishlistItemFormData) => {
    try {
      const payload = {
        ...data,
        currency: Number(data.currency),
      }
      const newItem = await createWishlistItem({ ...payload, wishlist_id: wishlistId });
      
      // Optimistically update the cache immediately with the new item
      queryClient.setQueryData<{ items: unknown[]; [key: string]: unknown }>(['wishlist', wishlistUuid], (oldData) => {
        if (!oldData) return oldData;
        
        // Get the currency data for display
        const currencyData = currency?.find(c => c.value === data.currency.toString());
        const newItemWithCurrency = {
          ...newItem,
          currency: { code: currencyData?.code || 'USD' }
        };
        
        return {
          ...oldData,
          items: [...oldData.items, newItemWithCurrency]
        };
      });
      
      // Also invalidate wishlists query to update item count on index page
      await queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      
      toast.success("Wishlist item added successfully!");
      
      // Close dialog after successful completion
      closeDialog();
    } catch (error) {
      // Handle error (show error message, etc.)
      console.error('Error creating wishlist item', error)
      toast.error("Failed to add item to wishlist. Please try again.");
    }
  }

  const closeDialog = () => {
    reset();
    setOpen(false);
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full h-16 w-16 md:h-14 md:w-14 sm:h-12 sm:w-12 absolute bottom-4 right-4 bg-accent hover:bg-accent/90">
          <Plus className="size-6" />
          <span className="sr-only">Add Item</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Add to Wishlist</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Add a new item to your wishlist. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <WishlistItemFormFields
              control={control}
              register={register}
              errors={errors}
              currencies={currency}
              showCurrency={true}
              handlePriceChange={handlePriceChange}
            />
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={!isValid || isSubmitting}>Add to Wishlist</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}