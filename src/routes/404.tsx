import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Search } from 'lucide-react'

export function NotFoundPage() {
  return (
    <main className="w-screen h-screen flex items-center justify-center p-4 bg-linear-to-b from-background to-muted/20">
      <div className="max-w-lg w-full mx-auto">
        <Card className="border-none shadow-2xl px-6 py-10 bg-card/80 backdrop-blur">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Decorative Icon */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl"></div>
              <div className="relative bg-background rounded-full w-32 h-32 flex items-center justify-center border-2 border-accent/20 shadow-lg">
                <Gift className="h-14 w-14 text-accent/60 animate-pulse" strokeWidth={1.5} />
              </div>
            </div>
            
            {/* Error Code */}
            <div className="space-y-2">
              <h1 className="text-8xl font-bold bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">
                404
              </h1>
            </div>

            {/* Messaging */}
            <div className="space-y-3 pt-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                This Page Didn't Make the List
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
                We searched high and low, but this page seems to have been gifted to someone else. 
                Let's get you back to your wishlist.
              </p>
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Looking for something specific?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check your wishlists or head back to the homepage to find what you need.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <Link to="/">
                Take Me Back
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Still lost?{" "}
            <a href="mailto:support@wishlist.com" className="text-accent hover:underline font-medium">
              We're here to help
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

