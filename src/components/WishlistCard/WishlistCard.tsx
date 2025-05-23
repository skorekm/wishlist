import { motion } from "motion/react"
// import { Clock } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Database } from "@/database.types"

interface WishlistCardProps {
  list: Database['public']['Tables']['wishlists']['Row']
  onClick: () => void
}

export function WishlistCard({ list, onClick }: WishlistCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card
        className="overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground cursor-pointer h-full flex flex-col"
        onClick={onClick}
      >
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">{list.name}</CardTitle>
          <CardDescription className="text-muted-foreground mt-1 line-clamp-1">{list.description}</CardDescription>
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

