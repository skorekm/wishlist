import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/database.types'
import { updateWishlistItem } from '@/services'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRIORITY_OPTIONS } from '@/constants'

type WishlistItemFormData = {
  name: string
  price: number
  priority: Database["public"]["Enums"]["priority"]
  category: string
  link?: string | null
  notes?: string | null
}

const listFormSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(50, "Item name cannot be longer than 50 characters")
    .trim(),
  price: z.coerce.number()
    .min(0, "Price must be greater than 0")
    .max(10000, "Price cannot be greater than 10000"),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category cannot be longer than 50 characters")
    .trim(),
  link: z.string()
    .trim()
    .url("Invalid URL")
    .optional()
    .nullable()
    .transform((val) => val || null),
  notes: z.string()
    .max(250, "Notes cannot be longer than 250 characters")
    .trim()
    .optional()
    .nullable(),
});

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
  } = useForm<WishlistItemFormData>({
    resolver: zodResolver(listFormSchema),
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

  const onSubmit = async (data: WishlistItemFormData) => {
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
      <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit Wishlist Item</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update the details of your wishlist item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className='font-semibold' htmlFor="name">Item Name <span className="text-red-500" aria-hidden>*</span></Label>
              <Input id="name" placeholder="e.g., wireless charger" required aria-invalid={!!errors.name} {...register('name')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.name?.message || '\u00A0'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <Label className='font-semibold' htmlFor="price">Price <span className="text-red-500" aria-hidden>*</span></Label>
                <Input id="price" type="number" placeholder="e.g., 100" required aria-invalid={!!errors.price} {...register('price')} />
                <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.price?.message || '\u00A0'}</p>
              </div>
              <div className="w-1/2">
                <Label className='font-semibold' htmlFor="priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger aria-required="true" aria-invalid={!!errors.priority}>
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.priority?.message || '\u00A0'}</p>
              </div>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="category">Category <span className="text-red-500" aria-hidden>*</span></Label>
              <Input id="category" placeholder="e.g., electronics" required aria-invalid={!!errors.category} {...register('category')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.category?.message || '\u00A0'}</p>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="link">Link</Label>
              <Input id="link" placeholder="e.g., https://" {...register('link')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.link?.message || '\u00A0'}</p>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="e.g., I want this for my birthday" {...register('notes')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.notes?.message || '\u00A0'}</p>
            </div>
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