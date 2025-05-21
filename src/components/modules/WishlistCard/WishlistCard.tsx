import { useState } from "react"
import { motion } from "motion/react"
import { MoreHorizontal, TriangleAlert } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from 'react-toastify';
import { deleteWishlist } from "@/services"
import { Database } from "@/database.types"
import { cardHover } from "@/lib/motion"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditList } from "@/components/modules/EditList/EditList"

type WishlistCard = Database['public']['Tables']['wishlists']['Row'] & {
  items: number
}

interface WishlistCardProps {
  list: WishlistCard
  refetchWishlists: () => void
}

export function WishlistCard({ list, refetchWishlists }: WishlistCardProps) {
  const [actionModal, setActionModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openEditModal = (e: React.MouseEvent) => {
    handleDropdownClick(e);
    setEditModal(true);
  }

  const openDeleteModal = (e: React.MouseEvent) => {
    handleDropdownClick(e);
    setActionModal(true);
  }

  const deleteList = () => {
    setIsDeleting(true);
    deleteWishlist(Number(list.id)).then(() => {
      refetchWishlists();
      toast.success("Wishlist deleted successfully!");
    }).catch((error) => {
      console.error('Error deleting wishlist', error);
      toast.error("Failed to delete wishlist. Please try again.");
    }).finally(() => {
      setIsDeleting(false);
      setActionModal(false);
    });
  }

  return (
    <motion.div
      variants={cardHover}
      whileHover="hover"
      whileTap="rest"
    >
      <Link
        to="/wishlists/$id"
        params={{ id: list.uuid }}
        className="block"
      >
        <Card
          className="p-4 overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground cursor-pointer h-full flex flex-col"
        >
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium text-foreground">{list.name}</CardTitle>
              <CardDescription className="text-muted-foreground mt-1 line-clamp-1">{list.description}</CardDescription>
            </div>
            <Dialog open={actionModal} onOpenChange={setActionModal}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openEditModal} className="cursor-pointer">Edit List</DropdownMenuItem>
                  {/* <DropdownMenuItem disabled className="cursor-pointer">Duplicate List</DropdownMenuItem>
                  <DropdownMenuItem disabled className="cursor-pointer">Share List</DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem onClick={openDeleteModal} className="cursor-pointer text-destructive">Delete List</DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src="/placeholder.svg?height=20&width=20" alt={list.ownerName} />
                <AvatarFallback>{list.ownerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Created by {list.ownerName}</span>
            </div> */}
            <div className="flex justify-between items-center mt-auto">
              <div className="text-sm text-muted-foreground">
                {list.items} {list.items === 1 ? "item" : "items"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <Dialog open={actionModal} onOpenChange={setActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TriangleAlert className="size-5 text-destructive mr-2" />
              <span>Delete List</span>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete <strong>"{list.name}"</strong>? This action cannot be undone.
            </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(false)}>Cancel</Button>
            <Button disabled={isDeleting} variant="default" onClick={deleteList}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditList 
        list={list} 
        isOpen={editModal} 
        onOpenChange={setEditModal} 
        onSuccess={refetchWishlists} 
      />
    </motion.div>
  )
}

