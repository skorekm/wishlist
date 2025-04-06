import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"

export const Route = createFileRoute('/')({
  component: LoginPage,
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
          emailRedirectTo: `${window.location.origin}/lists`,
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
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-medium text-[#3a3a3a]">Welcome to Wishlist</CardTitle>
            <CardDescription className="text-[#6b6b6b]">
              Create and share your wishlists with friends and family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="h-20 w-20 rounded-full bg-[#f0ede8] flex items-center justify-center mx-auto mb-4">
                <Gift className="h-10 w-10 text-[#f97171]" />
              </div>
              <p className="text-sm text-[#6b6b6b]">Sign in or create an account to start building your wishlists</p>
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
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="outline" className="w-full rounded-full"
                  >
                    {loading ? 'Sending magic link...' : 'Send magic link'}
                  </Button>
                </div>
              </form>

            </div>

          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-[#e8e4de] pt-6">
            <p className="text-xs text-center text-[#8a8a8a]">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#6b6b6b]">
            Need help?{" "}
            <a href="#" className="text-[#f97171] hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
