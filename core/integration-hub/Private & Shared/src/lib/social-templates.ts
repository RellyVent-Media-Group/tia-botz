export type TemplateType = "square" | "story" | "banner" | "thumbnail" | "vertical" | "landscape" | "link-preview";

export interface SocialTemplate {
  id: string;
  type: TemplateType;
  name: string;
  platform: string;
  aspectRatio: string;
  description: string;
}

export const TEMPLATE_TYPES: TemplateType[] = ["square", "story", "banner", "thumbnail", "vertical", "landscape", "link-preview"];

export const SOCIAL_TEMPLATES: SocialTemplate[] = [
  {
    id: "instagram-square",
    type: "square",
    name: "Instagram Square",
    platform: "Instagram",
    aspectRatio: "1:1",
    description: "Standard square post format for Instagram feed posts",
  },
  {
    id: "instagram-story",
    type: "story",
    name: "Instagram Story",
    platform: "Instagram",
    aspectRatio: "9:16",
    description: "Full-screen vertical story format with progress bars",
  },
  {
    id: "twitter-banner",
    type: "banner",
    name: "Twitter/X Banner",
    platform: "Twitter/X",
    aspectRatio: "16:9",
    description: "Horizontal banner format for profile headers",
  },
  {
    id: "youtube-thumbnail",
    type: "thumbnail",
    name: "YouTube Thumbnail",
    platform: "YouTube",
    aspectRatio: "16:9",
    description: "Video thumbnail with bold headline and overlay text",
  },
  {
    id: "youtube-shorts",
    type: "vertical",
    name: "YouTube Shorts",
    platform: "YouTube Shorts",
    aspectRatio: "9:16",
    description: "Vertical short-form video with hook text and CTA",
  },
  {
    id: "tiktok-vertical",
    type: "vertical",
    name: "TikTok Video",
    platform: "TikTok",
    aspectRatio: "9:16",
    description: "Vertical video with trending audio caption and overlay",
  },
  {
    id: "linkedin-post",
    type: "landscape",
    name: "LinkedIn Post",
    platform: "LinkedIn",
    aspectRatio: "1.91:1",
    description: "Professional post image with headline and subtext",
  },
  {
    id: "facebook-square",
    type: "square",
    name: "Facebook Square",
    platform: "Facebook",
    aspectRatio: "1:1",
    description: "Square post for Facebook feed with engagement elements",
  },
  {
    id: "pinterest-pin",
    type: "vertical",
    name: "Pinterest Pin",
    platform: "Pinterest",
    aspectRatio: "2:3",
    description: "Vertical pin with overlay text and save prompt",
  },
  {
    id: "threads-post",
    type: "square",
    name: "Threads Post",
    platform: "Threads",
    aspectRatio: "1:1",
    description: "Square image for Threads with concise text overlay",
  },
  {
    id: "telegram-post",
    type: "landscape",
    name: "Telegram Post",
    platform: "Telegram",
    aspectRatio: "16:9",
    description: "Channel post image with headline and link",
  },
  {
    id: "whatsapp-status",
    type: "story",
    name: "WhatsApp Status",
    platform: "WhatsApp",
    aspectRatio: "9:16",
    description: "Status update with text overlay and emoji",
  },
  {
    id: "linktree-card",
    type: "link-preview",
    name: "Linktree Card",
    platform: "Linktree",
    aspectRatio: "1:1.91",
    description: "Button-style card with CTA and brand elements",
  },
];

export interface TemplateData {
  eyebrow?: string;
  headline: string;
  subtext?: string;
  brand?: string;
  cta?: string;
  character?: string;
  platform?: string;
}

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  square: "Square Post",
  story: "Story/Reel",
  banner: "Banner",
  thumbnail: "Thumbnail",
  vertical: "Vertical Video",
  landscape: "Landscape Post",
  "link-preview": "Link Preview",
};
