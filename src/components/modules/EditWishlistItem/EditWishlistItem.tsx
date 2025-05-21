import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
    .min(1, "List name is required")
    .max(50, "List name cannot be longer than 50 characters")
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
  onSuccess: () => void
}

export function EditWishlistItem({ item, isOpen, onOpenChange, onSuccess }: EditWishlistItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors },
  } = useForm<WishlistItemFormData>({
    resolver: zodResolver(listFormSchema),
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
      onSuccess();
      onOpenChange(false);
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
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g., wireless charger" {...register('name')} />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div className="mb-4 flex items-center gap-2">
              <div className="w-1/2">
                <Label className='font-semibold' htmlFor="price">Price</Label>
                <Input id="price" type="number" placeholder="e.g., 100" {...register('price')} />
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
                      <SelectTrigger>
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
              </div>
            </div>
              {errors.price && <p className="text-red-500">{errors.price.message}</p>}
              {errors.priority && <p className="text-red-500">{errors.priority.message}</p>}
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g., electronics" {...register('category')} />
              {errors.category && <p className="text-red-500">{errors.category.message}</p>}
            </div>
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="link">Link</Label>
              <Input id="link" placeholder="e.g., https://" {...register('link')} />
              {errors.link && <p className="text-red-500">{errors.link.message}</p>}
            </div>
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="e.g., I want this for my birthday" {...register('notes')} />
              {errors.notes && <p className="text-red-500">{errors.notes.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 