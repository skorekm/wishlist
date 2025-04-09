import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createWishlist } from '@/services'
import { Database } from '@/database.types'

type WishlistFormData = Pick<Database['public']['Tables']['wishlists']['Insert'], 'name' | 'description'>

const listFormSchema = z.object({
  name: z.string()
    .min(1, "List name is required")
    .max(50, "List name cannot be longer than 50 characters")
    .trim(),
  description: z.string()
    .max(250, "Description cannot be longer than 250 characters")
    .trim()
    .optional()
    .transform(val => val === '' ? null : val)
    .nullable()
});

export function AddList({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);

  const { 
    register, 
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WishlistFormData>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  })

  const onSubmit = async (data: WishlistFormData) => {
    try {
      await createWishlist(data);
      onSuccess();
    } catch (error) {
      // Handle error (show error message, etc.)
      console.error('Error creating wishlist', error)
    }
  }

  const closeDialog = () => {
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button className="bg-accent hover:bg-accent/90">
            <PlusCircle className="h-4 w-4 mr-1" />
            New List
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Create New List</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Give your new wishlist a name and description
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="list-name" className="dark:text-gray-300">
                List Name
              </Label>
              <Input
                id="list-name"
                placeholder="e.g., Birthday Wishlist"
                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-description" className="dark:text-gray-300">
                Description (optional)
              </Label>
              <Input
                id="list-description"
                placeholder="e.g., Things I'd love to receive for my birthday"
                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} type="reset" variant="outline" className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">Create List</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}