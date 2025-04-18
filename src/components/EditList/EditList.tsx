import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Database } from '@/database.types'
import { updateWishlist } from '@/services'

type WishlistFormData = {
  name: string
  description?: string | null
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
    formState: { errors },
  } = useForm<WishlistFormData>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: list.name,
      description: list.description,
    }
  })

  const onSubmit = async (data: WishlistFormData) => {
    setIsUpdating(true);
    try {
      await updateWishlist(list.id, data);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating wishlist', error)
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
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="name">List Name</Label>
              <Input id="name" placeholder="e.g., Birthday Wishlist" {...register('name')} />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="e.g., Items I'd love to receive for my birthday" {...register('description')} />
              {errors.description && <p className="text-red-500">{errors.description.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 