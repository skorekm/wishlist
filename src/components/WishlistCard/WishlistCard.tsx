import { motion } from "motion/react"
// import { Clock } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { Database } from "@/database.types"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteWishlist } from "@/services"
interface WishlistCardProps {
  list: Database['public']['Tables']['wishlists']['Row']
  onClick: () => void
  refetchWishlists: () => void
}

export function WishlistCard({ list, onClick, refetchWishlists }: WishlistCardProps) {

  const deleteList = async () => {
    console.log('deleting list', list.id)
    await deleteWishlist(list.id)
    refetchWishlists()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
          <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">Edit List</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Duplicate List</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Share List</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={deleteList} className="text-destructive cursor-pointer">Delete List</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

