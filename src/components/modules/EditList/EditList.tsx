import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/database.types'
import { updateWishlist } from '@/services'

type WishlistFormData = {
  name: string
  description?: string | null
  event_date?: string | null
}

const listFormSchema = z.object({
  name: z.string()
    .min(1, "List name is required")
    .max(50, "List name cannot be longer than 50 characters")
    .trim(),
  description: z.string()
    .max(250, "Description cannot be longer than 250 characters")
    .trim()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  event_date: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
});

interface EditListProps {
  list: Database['public']['Tables']['wishlists']['Row']
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditList({ list, isOpen, onOpenChange, onSuccess }: EditListProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    handleSubmit,
    reset,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WishlistFormData>({
    resolver: zodResolver(listFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: list.name,
      description: list.description,
      event_date: list.event_date || '',
    }
  })

  const onSubmit = async (data: WishlistFormData) => {
    setIsUpdating(true);
    try {
      await updateWishlist(list.id, data);
      onSuccess();
      onOpenChange(false);
      toast.success("Wishlist updated successfully!");
    } catch (error) {
      console.error('Error updating wishlist', error)
      toast.error("Failed to update wishlist. Please try again.");
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
            <DialogTitle className="dark:text-gray-100">Edit Wishlist</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update the details of your wishlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className='font-semibold' htmlFor="name">List Name <span className="text-red-500" aria-hidden>*</span></Label>
              <Input id="name" placeholder="e.g., Birthday Wishlist" required aria-invalid={!!errors.name} {...register('name')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.name?.message || '\u00A0'}</p>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="e.g., Items I'd love to receive for my birthday" {...register('description')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.description?.message || '\u00A0'}</p>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="event-date">Event Date</Label>
              <Input id="event-date" type="date" {...register('event_date')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-4">{errors.event_date?.message || '\u00A0'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={!isValid || isSubmitting || isUpdating}>
              {isSubmitting || isUpdating ? 'Updating...' : 'Update List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 