import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Gift, Share2, Bell, Lock, Heart, Users, Sparkles, Star } from 'lucide-react'
import { motion, useScroll, useTransform, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { fadeIn, stagger, listItem } from '@/lib/motion'
import { supabase } from '@/supabaseClient'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const ctaRef = useRef(null)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: false, margin: "-100px" })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const ctaDestination = isAuthenticated ? '/wishlists' : '/login'
  const ctaText = isAuthenticated ? 'Go to My Wishlists' : 'Start Building Your Wishlist'

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient Blobs with enhanced movement */}
        <div className="absolute -top-1/2 -left-1/2 w-[120%] h-[120%] bg-accent/15 dark:bg-accent/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-1/2 -right-1/2 w-[120%] h-[120%] bg-primary/12 dark:bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-1/2 left-1/3 w-[120%] h-[120%] bg-accent/15 dark:bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-1/4 right-1/4 w-full h-full bg-primary/8 dark:bg-primary/8 rounded-full blur-3xl animate-blob animation-delay-6000" />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,113,113,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(249,113,113,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(249,113,113,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,113,113,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      {/* Header */}
      <motion.header
        className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-accent" />
            <span className="text-xl font-semibold">Wishlist</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isCheckingAuth && (
              <Link to={ctaDestination}>
                <Button variant="default">{isAuthenticated ? 'My Wishlists' : 'Sign In'}</Button>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="container mx-auto px-4 py-20 text-center relative">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gift boxes */}
          <motion.div
            className="absolute top-20 left-[10%] text-accent/40 dark:text-accent/30"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Gift className="w-12 h-12" />
          </motion.div>

          <motion.div
            className="absolute top-40 right-[15%] text-accent/40 dark:text-accent/30"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Gift className="w-16 h-16" />
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-[20%] text-accent/35 dark:text-accent/25"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <Gift className="w-10 h-10" />
          </motion.div>

          {/* Stars */}
          <motion.div
            className="absolute top-32 right-[25%] text-accent/50 dark:text-accent/35"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Star className="w-6 h-6 fill-current" />
          </motion.div>

          <motion.div
            className="absolute top-60 left-[15%] text-accent/50 dark:text-accent/35"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -180, -360],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            <Star className="w-5 h-5 fill-current" />
          </motion.div>

          <motion.div
            className="absolute bottom-32 right-[18%] text-accent/45 dark:text-accent/35"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 180, 360],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          >
            <Star className="w-7 h-7 fill-current" />
          </motion.div>

          {/* Sparkles */}
          <motion.div
            className="absolute top-48 right-[8%] text-accent/60 dark:text-accent/40"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>

          <motion.div
            className="absolute top-36 left-[8%] text-accent/60 dark:text-accent/40"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>

          <motion.div
            className="absolute bottom-40 left-[12%] text-accent/55 dark:text-accent/40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>

        <motion.div
          className="max-w-3xl mx-auto space-y-6 relative z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Radial glow behind text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 dark:bg-accent/20 rounded-full blur-[100px] animate-pulse-glow -z-10" />

          <motion.h1
            className="text-5xl md:text-6xl font-bold tracking-tight relative"
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            animate="show"
          >
            Gift-Giving,
            <span className="text-accent relative inline-block ml-2">
              Perfected
              {/* Subtle text glow effect */}
              <span className="absolute inset-0 blur-sm text-accent opacity-50" aria-hidden="true"> Perfected</span>
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            variants={fadeIn("up", 0.4)}
            initial="hidden"
            animate="show"
          >
            Transform how you share wishes with the people who matter most. Create beautiful wishlists,
            share them effortlessly, and eliminate the guesswork from every celebration.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center pt-4"
            variants={fadeIn("up", 0.6)}
            initial="hidden"
            animate="show"
          >
            {!isCheckingAuth && (
              <Link to={ctaDestination}>
                <Button size="lg" className="text-lg px-8 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 transition-all duration-300">
                  {ctaText}
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern Gift-Givers</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features wrapped in an intuitive experience
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate={featuresInView ? "show" : "hidden"}
        >
          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Gift className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>Organize with Purpose</CardTitle>
                <CardDescription>
                  Create unlimited wishlists tailored to every occasion—birthdays, weddings, holidays, or just because.
                  Keep your wishes organized and always within reach.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Share2 className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>One Link, Instant Access</CardTitle>
                <CardDescription>
                  No hoops to jump through. Your friends and family view your wishlist instantly—no signups,
                  no downloads, no hassle. Just click and browse.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Bell className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>Never Get Duplicates</CardTitle>
                <CardDescription>
                  Your cousin reserves the sweater. Your best friend sees it's taken and picks something else.
                  Coordination happens automatically—no awkward group chats required.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Lock className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>You Control Who Sees What</CardTitle>
                <CardDescription>
                  Create separate lists for different circles. Wedding registry for everyone, pricey items for close
                  family only. Revoke access anytime. Your wishlists, your rules.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Heart className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>Rich, Visual Context</CardTitle>
                <CardDescription>
                  Go beyond simple lists. Attach product images, prices, purchase links, and personal notes to give
                  gift-givers all the context they need.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl shadow-sm border-border/40 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center mb-3">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <CardTitle>Scales with You</CardTitle>
                <CardDescription>
                  Whether you're planning a family gift exchange or coordinating with a large friend group,
                  Wishlist adapts to your needs seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="container mx-auto px-4 py-16">
        <div className="bg-linear-to-br from-accent/5 via-background to-primary/5 dark:bg-muted/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none rounded-3xl p-8 md:p-12 max-w-6xl mx-auto relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Perfect Wishlist in Minutes</h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to better gift-giving
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={stagger}
              initial="hidden"
              animate={howItWorksInView ? "show" : "hidden"}
            >
              <motion.div className="text-center space-y-4" variants={listItem}>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent/30 blur-xl" />
                  <div className="relative w-full h-full rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-lg shadow-accent/20">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Sign In Securely</h3>
                <p className="text-muted-foreground">
                  Authenticate with Google in one click. We respect your data and never ask for more than necessary.
                </p>
              </motion.div>

              <motion.div className="text-center space-y-4" variants={listItem}>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent/30 blur-xl" />
                  <div className="relative w-full h-full rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-lg shadow-accent/20">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Build Your Lists</h3>
                <p className="text-muted-foreground">
                  Add items with rich details—images, prices, links, and notes. Make it easy for loved ones to nail the perfect gift.
                </p>
              </motion.div>

              <motion.div className="text-center space-y-4" variants={listItem}>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full bg-accent/20 dark:bg-accent/30 blur-xl" />
                  <div className="relative w-full h-full rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-lg shadow-accent/20">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Share & Celebrate</h3>
                <p className="text-muted-foreground">
                  Send your wishlist link and let the magic happen. Watch as gifts get reserved and surprises come to life.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="container mx-auto px-4 py-20 text-center">
        <motion.div
          className="max-w-2xl mx-auto space-y-6 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-primary/10 dark:from-accent/5 dark:to-primary/5 rounded-3xl blur-3xl -z-10" />

          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Gift-Giving?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of users who've already discovered a better way to celebrate.
            Free to start, easy to love.
          </p>
          {!isCheckingAuth && (
            <Link to={ctaDestination}>
              <Button size="lg" className="text-lg px-8 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 transition-all duration-300">
                {isAuthenticated ? 'Go to My Wishlists' : 'Create Your First Wishlist'}
              </Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Wishlist. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="mailto:support@wishlist.com" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
