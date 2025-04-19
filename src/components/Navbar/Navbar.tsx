import { useNavigate, useLocation } from "@tanstack/react-router";
import { supabase } from "@/supabaseClient";
import { GiftIcon, ArrowLeft } from "lucide-react"
import { motion } from "motion/react"
import { fadeIn } from "@/lib/motion"
import { Button } from "../ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  const handleBack = () => {
    navigate({ to: '/wishlists' })
  }

  const isDetailedPage = pathname.match(/^\/.+\/\d+$/)
  
  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-2" variants={fadeIn("right")}>
          {isDetailedPage && <Button onClick={handleBack} variant="ghost">
            <ArrowLeft className="size-5" />
          </Button>}
          <GiftIcon className="size-5 text-accent" />
          <span className="font-medium dark:text-gray-100">Wishlist</span>
        </motion.div>
        <motion.div className="flex items-center gap-3" variants={fadeIn("left")}>
          <Button onClick={handleLogout} variant="ghost">Logout</Button>
        </motion.div>
      </div>
    </nav>
  );
}
