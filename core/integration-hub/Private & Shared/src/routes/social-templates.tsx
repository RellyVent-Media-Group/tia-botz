import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/social-templates')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/social-templates"!</div>
}
