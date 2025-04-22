import { createFileRoute, redirect, useNavigate, Outlet } from "@tanstack/react-router"
import { supabase } from "../supabaseClient"
import { useEffect } from "react"
import { Navbar } from "@/components/modules/Navbar/Navbar"
import { fadeIn } from "@/lib/motion"
import { motion } from "motion/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
    return { session: data.session }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const queryClient = new QueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: '/' })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <QueryClientProvider client={queryClient}>
      <motion.div
        className="min-h-screen transition-colors duration-300"
        initial="hidden"
        animate="show"
        variants={fadeIn()}
      >
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </motion.div>
    </QueryClientProvider>
  )
}