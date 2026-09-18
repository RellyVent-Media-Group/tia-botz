import { createFileRoute } from "@tanstack/react-router";
import { VoIPDashboard } from "@/components/voip/voip-dashboard";

export const Route = createFileRoute("/voip-dashboard")({
  component: VoIPDashboard,
});