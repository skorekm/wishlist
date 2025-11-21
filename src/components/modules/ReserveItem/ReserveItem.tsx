import { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from "@/database.types";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

const reserveItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type ReserveItemFormData = z.infer<typeof reserveItemSchema>;

interface ReserveItemProps {
  item: Omit<Database['public']['Tables']['wishlist_items']['Row'], 'currency'> & { currency: { code: string } }
  authenticatedUser?: { id: string; email?: string } | null
  trigger?: React.ReactNode
}

export function ReserveItem({ item, authenticatedUser, trigger }: ReserveItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { isValid, isSubmitting, errors }, reset } = useForm<ReserveItemFormData>({
    resolver: zodResolver(reserveItemSchema),
    mode: 'onChange',
    defaultValues: {
      name: authenticatedUser?.email?.split('@')[0] || '',
      email: authenticatedUser?.email || '',
    },
  });

  const onSubmit = async (data: ReserveItemFormData) => {
    const { error } = await supabase.functions.invoke('reserve-item', {
      body: { name: data.name, email: data.email, itemId: item.id },
    })
    if (error) {
      console.error('Error reserving item', error);
      toast.error("Error while reserving an item")
    } else {
      toast.success('Item reserved')
      queryClient.invalidateQueries({ queryKey: ['shared-wishlist'] })
    }
    closeDialog();
  }

  const closeDialog = () => {
    reset({
      name: authenticatedUser?.email?.split('@')[0] || '',
      email: authenticatedUser?.email || '',
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : closeDialog()}>
      <DialogTrigger asChild>
        {trigger || <Button>Grab</Button>}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Reserve Item</DialogTitle>
            <DialogDescription>
              Fill out your information to reserve <b>{item.name}</b>. Please provide your name and email. The item will be reserved for you for the next <b>48 hours</b>. <br/> 
              We need your email so that you can change the item status to purchased!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500" aria-hidden>*</span></Label>
              <Input 
                id="name" 
                placeholder="Enter your name" 
                aria-invalid={!!errors.name}
                required
                {...register('name')} 
              />
              <p className="text-xs text-red-500 min-h-4 mt-0.5">{errors.name?.message || '\u00A0'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500" aria-hidden>*</span></Label>
              <Input
                id="email"
                placeholder="Enter your email"
                aria-invalid={!!errors.email}
                type="email"
                required
                {...register('email')}
              />
              <p className="text-xs text-red-500 min-h-4 mt-0.5">{errors.email?.message || '\u00A0'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>Reserve Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}