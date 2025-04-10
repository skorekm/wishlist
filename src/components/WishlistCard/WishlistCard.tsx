import { useState } from "react"
import { motion } from "motion/react"
// import { Clock } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { deleteWishlist } from "@/services"
import { Database } from "@/database.types"
import { cardHover } from "@/lib/motion"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
interface WishlistCardProps {
  list: Database['public']['Tables']['wishlists']['Row']
  onClick: () => void
  refetchWishlists: () => void
}

export function WishlistCard({ list, onClick, refetchWishlists }: WishlistCardProps) {
  const [actionModal, setActionModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteList = () => {
    setIsDeleting(true);
    deleteWishlist(Number(list.id)).then(() => {
      refetchWishlists();
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
      <Card
        className="overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground cursor-pointer h-full flex flex-col"
        onClick={onClick}
      >
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium text-foreground">{list.name}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 line-clamp-1">{list.description}</CardDescription>
          </div>
          <Dialog open={actionModal} onOpenChange={setActionModal}>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="cursor-pointer">Edit List</DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-pointer">Duplicate List</DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-pointer">Share List</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem onClick={() => setActionModal(true)} className="cursor-pointer text-destructive">Delete List</DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionModal(false)}>Cancel</Button>
                <Button disabled={isDeleting} variant="default" onClick={deleteList}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        {/* <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-5 w-5">
              <AvatarImage src="/placeholder.svg?height=20&width=20" alt={list.ownerName} />
              <AvatarFallback>{list.ownerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Created by {list.ownerName}</span>
          </div>
          <div className="flex justify-between items-center mt-auto">
            <div className="text-sm text-muted-foreground">
              {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
            </div>
          </div>
        </CardContent> */}
      </Card>
    </motion.div>
  )
}

