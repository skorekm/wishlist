"use client"

import { motion } from "motion/react"
import { Heart, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WishlistItemCardProps {
  item: {
    id: number
    name: string
    price: number
    link: string | null
    notes: string | null
    priority: string
  }
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground h-full flex flex-col">
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
            <span className="font-medium text-foreground">${item.price.toFixed(2)}</span>
          </div>
          {/* <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {tag}
              </Badge>
            ))}
          </div> */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{item.notes}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              {new URL(item.link).hostname}
            </a>
          )}
          {/* <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
            <Badge variant="outline" className="text-xs font-normal bg-transparent">
              {item.priority}
            </Badge>
            {item.purchased && (
              <Badge variant="outline" className="text-xs font-normal bg-transparent text-green-600 border-green-200">
                Purchased
              </Badge>
            )}
          </div> */}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="w-full flex gap-2">
            {item.link ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  if (item.link) {
                    window.open(item.link, "_blank")
                  }
                }}
              >
                Visit Store
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="flex-1 text-sm">
                View Details
              </Button>
            )}
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <Heart className="h-4 w-4 text-wishlist-primary" />
              <span className="sr-only">Favorite</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

