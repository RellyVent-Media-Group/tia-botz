import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { SAMPLE_CAMPAIGN } from "@/lib/content-calendar";

export const Route = createFileRoute("/api/content-calendar")({
  loader: async () => {
    // Return JSON response for API calls
    return new Response(JSON.stringify(SAMPLE_CAMPAIGN), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
});