import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle } from 'lucide-react'

export function AddList() {
  return (
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
  )
}