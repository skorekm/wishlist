import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/lists')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/lists"!</div>
}
