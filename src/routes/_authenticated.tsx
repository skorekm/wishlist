import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { supabase } from "../supabaseClient"
import { Navbar } from "@/components/modules/Navbar/Navbar"
import { fadeIn } from "@/lib/motion"
import { motion } from "motion/react"

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
    return { user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {

  return (
    <motion.div
      className="bg-background min-h-screen transition-colors duration-300"
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