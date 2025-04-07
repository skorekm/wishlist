import { createFileRoute, redirect, useNavigate, Outlet } from "@tanstack/react-router"
import { supabase } from "../supabaseClient"
import { useEffect } from "react"
import { Navbar } from "@/components/Navbar/Navbar"

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: '/' })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}