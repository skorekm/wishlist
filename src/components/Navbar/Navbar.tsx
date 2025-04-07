import { GiftIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function Navbar() {
  return (
    <nav className="bg-white border-b border-[#e8e4de] py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-[#f97171]" />
          <span className="font-medium text-[#3a3a3a]">Wishlist</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
