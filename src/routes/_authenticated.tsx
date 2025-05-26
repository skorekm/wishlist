import { createFileRoute, redirect, useNavigate, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { supabase } from "../supabaseClient"
import { useEffect } from "react"
import { Navbar } from "@/components/modules/Navbar/Navbar"
import { fadeIn } from "@/lib/motion"
import { motion } from "motion/react"

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
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate({ to: '/' })
      }
    }
    checkAuth()

  }, [navigate])

  return (
    <motion.div
      className="min-h-screen transition-colors duration-300"
      initial="hidden"
      animate="show"
      variants={fadeIn()}
    >
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
        <TanStackRouterDevtools />
      </main>
    </motion.div>
  )
}