import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/')({
  component: LoginPage,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/wishlists',
      })
    }
  }
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/wishlists`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the login link!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4 w-full h-full">
      <div className="max-w-md">
        <Card className="border-none shadow-lg px-4 py-6">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-medium">Welcome to Wishlist</CardTitle>
            <CardDescription className="text-muted-foreground">
              Create and share your wishlists with friends and family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="h-20 w-20 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
                <Gift className="h-10 w-10 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Sign in or create an account to start building your wishlists</p>
            </div>

            <div className="space-y-4">
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                {message && (
                  <div className="text-green-500 text-sm text-center">{message}</div>
                )}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    className="w-full"
                  >
                    {loading ? 'Sending magic link...' : 'Send magic link'}
                  </Button>
                </div>
              </form>

            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-muted-foreground/20 pt-6">
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <a href="#" className="text-accent hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
