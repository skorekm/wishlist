import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { AddList } from '@/components/AddList/AddList'
import { WishlistCard } from '@/components/WishlistCard/WishlistCard'
import { getWishlists } from '@/services'

export const Route = createFileRoute('/_authenticated/lists')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: wishlists, isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: getWishlists,
  })

  const refetchWishlists = () => {
    queryClient.invalidateQueries({ queryKey: ['wishlists'] });
  }


  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-medium dark:text-gray-100">My Wishlists</h1>
          <p className="text-muted-foreground mt-1">Manage and organize all your wishlists</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-500" />
            <Input
              placeholder="Search lists..."
              className="pl-9 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddList
            onSuccess={refetchWishlists}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <div>Loading...</div>}
        {!isLoading && wishlists?.map((list) => (
          <WishlistCard
            key={list.id}
            list={list}
            onClick={() => null}
          />
        ))}
      </div>
    </div>
  )
}
