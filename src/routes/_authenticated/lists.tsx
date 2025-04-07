import { createFileRoute } from '@tanstack/react-router'
import { Grid, ListIcon, PlusCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'


export const Route = createFileRoute('/_authenticated/lists')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-[#3a3a3a] dark:text-gray-100">My Wishlists</h1>
        <p className="text-[#6b6b6b] dark:text-gray-400 mt-1">Manage and organize all your wishlists</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a8a8a] dark:text-gray-500" />
          <Input
            placeholder="Search lists..."
            className="pl-9 rounded-full border-[#e8e4de] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center border rounded-full p-1 bg-white dark:bg-gray-800 dark:border-gray-700">
          <div>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-8 w-8 p-0 ${viewMode === "grid" ? "bg-[#f97171] hover:bg-[#f85e5e] dark:bg-[#f97171] dark:hover:bg-[#f85e5e]" : "dark:text-gray-300"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
          </div>
          <div>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-8 w-8 p-0 ${viewMode === "list" ? "bg-[#f97171] hover:bg-[#f85e5e] dark:bg-[#f97171] dark:hover:bg-[#f85e5e]" : "dark:text-gray-300"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <div>
              <Button className="rounded-full bg-[#f97171] hover:bg-[#f85e5e]">
                <PlusCircle className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
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
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list-description" className="dark:text-gray-300">
                  Description (optional)
                </Label>
                <Input
                  id="list-description"
                  placeholder="e.g., Things I'd love to receive for my birthday"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#f97171] hover:bg-[#f85e5e]">Create List</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
