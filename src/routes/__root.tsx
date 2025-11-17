import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { CookieConsent } from '@/components/modules/CookieConsent'
import { NotFoundPage } from './404'

export const Route = createRootRoute({
  component: () => (
    <div className="w-screen h-screen">
      <Outlet />
      <TanStackRouterDevtools />
      <CookieConsent />
    </div>
  ),
  notFoundComponent: NotFoundPage,
})