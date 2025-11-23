import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import { supabase } from "@/supabaseClient";
import { GiftIcon, ArrowLeft, Settings, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { fadeIn } from "@/lib/motion"
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  /** Override the home link destination */
  homeLink?: string
  /** Show back button on detailed pages */
  showBackButton?: boolean
  /** User info for unauthenticated views */
  user?: { id: string; email?: string } | null
  /** Custom logout handler */
  onLogout?: () => void | Promise<void>
  /** Path to redirect to after login (for unauthenticated users) */
  loginRedirect?: string
}

export function Navbar({ 
  homeLink,
  showBackButton = true,
  user,
  onLogout,
  loginRedirect
}: NavbarProps = {}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      await supabase.auth.signOut()
      navigate({ to: '/login', search: { redirect: undefined } })
    }
    setIsMobileMenuOpen(false);
  }

  const isDetailedPage = showBackButton && pathname.match(/\/[^/]+\/[^/]+$/)
  
  // Determine if user is authenticated
  // If user prop is provided, use it; otherwise assume unauthenticated
  const isAuthenticated = user !== undefined ? user !== null : false
  const finalHomeLink = homeLink || (isAuthenticated ? "/wishlists" : "/")

  return (
    <nav className="bg-background border-b border-border py-3 sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to={finalHomeLink} onClick={() => setIsMobileMenuOpen(false)}>
          <motion.div
            className="flex items-center gap-2"
            variants={fadeIn("right")}
            initial="hidden"
            animate="show"
          >
            {isDetailedPage && (
              <Button variant="ghost" aria-label="Back to wishlists" className="hidden sm:flex">
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <GiftIcon className="size-5 text-accent" />
            <span className="font-medium dark:text-gray-100">Wishlist</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          variants={fadeIn("left")}
          initial="hidden"
          animate="show"
        >
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Change Language">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('pl')}>
                Polski
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAuthenticated ? (
            <>
              <Link to="/settings">
                <Button variant="ghost" size="icon" title={t('navbar.profile')}>
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline">{t('navbar.logout')}</Button>
            </>
          ) : (
            <Link to="/login" search={{ redirect: loginRedirect }}>
              <Button variant="outline">{t('navbar.login')}</Button>
            </Link>
          )}
        </motion.div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Change Language">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('pl')}>
                Polski
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground font-medium px-2">Account</span>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('navbar.profile')}</span>
                    </Link>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                    {t('navbar.logout')}
                  </Button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  search={{ redirect: loginRedirect }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">{t('navbar.login')}</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
