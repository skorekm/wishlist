import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Database } from '@/database.types'
import { createWishlistItem, getCurrencies } from '@/services'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRIORITY_OPTIONS } from '@/constants'

type WishlistItemFormData = {
  name: string
  price: number
  currency: string;
  priority: Database["public"]["Enums"]["priority"]
  category: string
  link: string | null
  notes?: string | null
}

const listFormSchema = z.object({
  name: z.string()
    .min(1, "List name is required")
    .max(50, "List name cannot be longer than 50 characters")
    .trim(),
  price: z.number({
    invalid_type_error: "Price must be a number",
    required_error: "Price is required"
  })
    .min(0, "Price must be greater than 0")
    .max(10000, "Price cannot be greater than 10000"),
  currency: z.string({
    required_error: "Currency is required"
  }),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category cannot be longer than 50 characters")
    .trim(),
  link: z.string()
    .trim()
    .transform(val => val === '' ? null : val)
    .nullable()
    .pipe(
      z.string().url("Invalid link address").nullable()
    ),
  notes: z.string()
    .max(250, "Notes cannot be longer than 250 characters")
    .trim()
    .optional()
    .nullable(),
});

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
  } = useForm<WishlistItemFormData>({
    resolver: zodResolver(listFormSchema),
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

  const onSubmit = async (data: WishlistItemFormData) => {
    try {
      const payload = {
        ...data,
        currency: Number(data.currency),
      }
      const newItem = await createWishlistItem({ ...payload, wishlist_id: wishlistId });
      
      // Close dialog first
      closeDialog();
      
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
          <div className="py-4 space-y-4">
            <div className="mb-4">
              <Label className='font-semibold' htmlFor="name">Item Name <span className="text-red-500" aria-hidden>*</span></Label>
              <Input id="name" placeholder="e.g., Wireless charger" required aria-invalid={!!errors.name} {...register('name')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.name?.message || '\u00A0'}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <>
                      <Label className='font-semibold' htmlFor="price">Price <span className="text-red-500" aria-hidden>*</span></Label>
                      <Input id="price" type="number" placeholder="e.g., 100" required aria-invalid={!!errors.price} onChange={e => handlePriceChange(e, field.onChange)} value={field.value ?? ''} />
                      <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.price?.message || '\u00A0'}</p>
                    </>
                  )}
                />
              </div>
              <div className="w-1/2">
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <>
                      <Label className='font-semibold' htmlFor="currency">Currency <span className="text-red-500" aria-hidden>*</span></Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-required="true" aria-invalid={!!errors.currency}>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currency?.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.currency?.message || '\u00A0'}</p>
                    </>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className='w-1/2'>
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
                <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.priority?.message || '\u00A0'}</p>
              </div>
              <div className="w-1/2">
                <Label className='font-semibold' htmlFor="category">Category <span className="text-red-500" aria-hidden>*</span></Label>
                <Input id="category" placeholder="e.g., Electronics" required aria-invalid={!!errors.category} {...register('category')} />
                <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.category?.message || '\u00A0'}</p>
              </div>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="link">Link</Label>
              <Input id="link" placeholder="e.g., https://" {...register('link')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.link?.message || '\u00A0'}</p>
            </div>
            <div>
              <Label className='font-semibold' htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="e.g., I want this for my birthday" {...register('notes')} />
              <p className="text-red-500 text-xs mt-0.5 min-h-[1rem]">{errors.notes?.message || '\u00A0'}</p>
            </div>
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