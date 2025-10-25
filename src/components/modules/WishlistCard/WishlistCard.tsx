import { useState } from "react"
import { motion } from "motion/react"
import { MoreHorizontal, Calendar } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Database } from "@/database.types"
import { cardHover } from "@/lib/motion"
import { getEventStatus } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditList } from "@/components/modules/EditList/EditList"
import { ShareListDialog } from "./ShareListDialog"
import { DeleteListDialog } from "./DeleteListDialog"

type WishlistCard = Database['public']['Tables']['wishlists']['Row'] & {
  items: number
}

interface WishlistCardProps {
  list: WishlistCard
  refetchWishlists: () => void
}

export function WishlistCard({ list, refetchWishlists }: WishlistCardProps) {
  const [deleteModal, setDeleteModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [shareModal, setShareModal] = useState(false)
  
  const eventStatus = getEventStatus(list.event_date)

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const openEditModal = (e: React.MouseEvent) => {
    handleDropdownClick(e)
    setEditModal(true)
  }

  const openShareModal = (e: React.MouseEvent) => {
    handleDropdownClick(e)
    setShareModal(true)
  }

  const openDeleteModal = (e: React.MouseEvent) => {
    handleDropdownClick(e)
    setDeleteModal(true)
  }

  return (
    <motion.div
      variants={cardHover}
      whileHover="hover"
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openEditModal} className="cursor-pointer">
                  Edit List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openShareModal} className="cursor-pointer">
                  Share List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openDeleteModal} className="cursor-pointer text-destructive">
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="flex justify-between items-end">
              <div className="text-sm text-muted-foreground">
                {list.items} {list.items === 1 ? "item" : "items"}
              </div>
              {eventStatus && (
                <div className={`flex items-center gap-1.5 text-sm ${eventStatus.color}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{eventStatus.text}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
      
      <DeleteListDialog
        wishlistId={list.id}
        wishlistName={list.name}
        isOpen={deleteModal}
        onOpenChange={setDeleteModal}
        onSuccess={refetchWishlists}
      />
      
      <EditList 
        list={list} 
        isOpen={editModal} 
        onOpenChange={setEditModal} 
        onSuccess={refetchWishlists} 
      />
      
      <ShareListDialog
        wishlistId={list.id}
        isOpen={shareModal}
        onOpenChange={setShareModal}
      />
    </motion.div>
  )
}

