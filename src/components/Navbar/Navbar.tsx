import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/supabaseClient";
import { GiftIcon } from "lucide-react"
import { motion } from "motion/react"
import { fadeIn } from "@/lib/motion"
import { Button } from "../ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-2" variants={fadeIn("right")}>
          <GiftIcon className="h-5 w-5 text-accent" />
          <span className="font-medium dark:text-gray-100">Wishlist</span>
        </motion.div>
        <motion.div className="flex items-center gap-3" variants={fadeIn("left")}>
          {/* <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar> */}
          <Button onClick={handleLogout} variant="ghost">Logout</Button>
        </motion.div>
      </div>
    </nav>
  );
}
