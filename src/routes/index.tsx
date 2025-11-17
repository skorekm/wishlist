import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Gift, Share2, Bell, Lock, Heart, Users } from 'lucide-react'
import { motion, useScroll, useTransform, useInView } from 'motion/react'
import { useRef } from 'react'
import { fadeIn, stagger, listItem } from '@/lib/motion'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-1/2 left-1/3 w-full h-full bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
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
            <Link to="/login">
              <Button variant="default">Sign In</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="container mx-auto px-4 py-20 text-center relative">
        <motion.div 
          className="max-w-3xl mx-auto space-y-6"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold tracking-tight"
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            animate="show"
          >
            Gift-Giving,
            <span className="text-accent"> Perfected</span>
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
            <Link to="/login">
              <Button size="lg" className="text-lg px-8">
                Start Building Your Wishlist
              </Button>
            </Link>
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
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Gift className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Organize with Purpose</CardTitle>
                <CardDescription>
                  Create unlimited wishlists tailored to every occasion—birthdays, weddings, holidays, or just because. 
                  Keep your wishes organized and always within reach.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Share2 className="h-10 w-10 text-accent mb-2" />
                <CardTitle>One Link, Instant Access</CardTitle>
                <CardDescription>
                  No hoops to jump through. Your friends and family view your wishlist instantly—no signups, 
                  no downloads, no hassle. Just click and browse.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Bell className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Never Get Duplicates</CardTitle>
                <CardDescription>
                  Your cousin reserves the sweater. Your best friend sees it's taken and picks something else. 
                  Coordination happens automatically—no awkward group chats required.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Lock className="h-10 w-10 text-accent mb-2" />
                <CardTitle>You Control Who Sees What</CardTitle>
                <CardDescription>
                  Create separate lists for different circles. Wedding registry for everyone, pricey items for close 
                  family only. Revoke access anytime. Your wishlists, your rules.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Heart className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Rich, Visual Context</CardTitle>
                <CardDescription>
                  Go beyond simple lists. Attach product images, prices, purchase links, and personal notes to give 
                  gift-givers all the context they need.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={listItem} whileHover="hover" initial="rest" animate="rest">
            <Card className="p-6 h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <Users className="h-10 w-10 text-accent mb-2" />
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
        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto">
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
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Sign In Securely</h3>
              <p className="text-muted-foreground">
                Authenticate with Google in one click. We respect your data and never ask for more than necessary.
              </p>
            </motion.div>

            <motion.div className="text-center space-y-4" variants={listItem}>
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Build Your Lists</h3>
              <p className="text-muted-foreground">
                Add items with rich details—images, prices, links, and notes. Make it easy for loved ones to nail the perfect gift.
              </p>
            </motion.div>

            <motion.div className="text-center space-y-4" variants={listItem}>
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Share & Celebrate</h3>
              <p className="text-muted-foreground">
                Send your wishlist link and let the magic happen. Watch as gifts get reserved and surprises come to life.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="container mx-auto px-4 py-20 text-center">
        <motion.div 
          className="max-w-2xl mx-auto space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Gift-Giving?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of users who've already discovered a better way to celebrate. 
            Free to start, easy to love.
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8">
              Create Your First Wishlist
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent" />
              <span className="font-semibold">Wishlist</span>
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
          <div className="text-center mt-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wishlist. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
