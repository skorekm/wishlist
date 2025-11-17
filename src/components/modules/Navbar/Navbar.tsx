import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import { supabase } from "@/supabaseClient";
import { GiftIcon, ArrowLeft, Settings } from "lucide-react"
import { motion } from "motion/react"
import { fadeIn } from "@/lib/motion"
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  const isDetailedPage = pathname.match(/\/[^/]+\/[^/]+$/)

  return (
    <nav className="bg-background border-b border-border py-3 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/wishlists">
          <motion.div
            className="flex items-center gap-2"
            variants={fadeIn("right")}
            initial="hidden"
            animate="show"
          >
            {isDetailedPage && (
              <Button variant="ghost" aria-label="Back to wishlists">
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <GiftIcon className="size-5 text-accent" />
            <span className="font-medium dark:text-gray-100">Wishlist</span>
          </motion.div>
        </Link>
        <motion.div
          className="flex items-center gap-3"
          variants={fadeIn("left")}
          initial="hidden"
          animate="show"
        >
          <ThemeToggle />
          <Link to="/settings">
            <Button variant="ghost" size="icon" title="Account Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </motion.div>
      </div>
    </nav>
  );
}
