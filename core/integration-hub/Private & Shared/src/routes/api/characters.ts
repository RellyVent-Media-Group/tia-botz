import { createFileRoute } from "@tanstack/react-router";
import { projects } from "@/lib/catalog";
import { SOCIAL_CHARACTERS } from "@/lib/social-characters";

export const Route = createFileRoute("/api/characters")({
  loader: async () => {
    const data = {
      projects: projects,
      socialCharacters: SOCIAL_CHARACTERS,
      total: projects.length + SOCIAL_CHARACTERS.length
    };
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
});