import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SAMPLE_CAMPAIGN, PLATFORM_LABELS, STATUS_LABELS, PILLAR_LABELS, getPostsByPlatform, getPostsByStatus, getPostsByPillar, getPostsByCharacter, getPlatformMetrics, getPillarMetrics, exportToCSV, addPost, updatePost, deletePost, type ContentPost } from "@/lib/content-calendar";
import { projects } from "@/lib/catalog";
import { SOCIAL_CHARACTERS } from "@/lib/social-characters";
import { Calendar, Filter, BarChart3, Instagram, Linkedin, Twitter, Video, User, Plus, Download, Trash2, Edit, TrendingUp, Users, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const allProjects = projects;

export const Route = createFileRoute("/content-calendar")({
  component: ContentCalendar,
});

function ContentCalendar() {
  const campaign = SAMPLE_CAMPAIGN;
  const [filter, setFilter] = useState<"all" | "published" | "planned" | "idea">("all");
  const [characterFilter, setCharacterFilter] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  let posts = campaign.posts;
  
  if (filter !== "all") {
    posts = getPostsByStatus(filter);
  }
  
  if (characterFilter) {
    posts = posts.filter((post) => post.characterId === characterFilter);
  }
  
  const publishedPosts = getPostsByStatus("published");
  const plannedPosts = getPostsByStatus("planned");
  const ideaPosts = getPostsByStatus("idea");

  const totalImpressions = campaign.posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
  const totalEngagement = campaign.posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
  
  const platformMetrics = getPlatformMetrics();
  const pillarMetrics = getPillarMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-amber-400" />
              <h1 className="text-4xl font-bold text-white">Content Calendar</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const csv = exportToCSV();
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'content-calendar.csv';
                  a.click();
                }}
                className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <a href="/social-templates">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Templates
                </Button>
              </a>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <AddPostForm onSubmit={(postData) => {
                    addPost(postData);
                    setShowAddDialog(false);
                  }} onCancel={() => setShowAddDialog(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <p className="text-slate-400 text-lg">{campaign.description}</p>
          <div className="mt-4 inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <span className="text-amber-400 font-medium">{campaign.theme}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Posts</div>
            <div className="text-3xl font-bold text-white">{campaign.posts.length}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Published</div>
            <div className="text-3xl font-bold text-green-400">{publishedPosts.length}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Impressions</div>
            <div className="text-3xl font-bold text-blue-400">{totalImpressions.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Engagement</div>
            <div className="text-3xl font-bold text-purple-400">{totalEngagement.toLocaleString()}</div>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Performance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Platform Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(platformMetrics).map(([platform, metrics]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platform === "instagram" && <Instagram className="w-5 h-5 text-pink-500" />}
                      {platform === "linkedin" && <Linkedin className="w-5 h-5 text-blue-500" />}
                      {platform === "twitter" && <Twitter className="w-5 h-5 text-sky-500" />}
                      {platform === "tiktok" && <Video className="w-5 h-5 text-white" />}
                      <span className="text-slate-300">{PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{metrics.count} posts</div>
                      <div className="text-slate-400 text-sm">{metrics.engagementRate.toFixed(1)}% engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Pillar Performance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Content Pillar Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(pillarMetrics).map(([pillar, metrics]) => (
                  <div key={pillar} className="flex items-center justify-between">
                    <span className="text-slate-300">{PILLAR_LABELS[pillar as keyof typeof PILLAR_LABELS]}</span>
                    <div className="text-right">
                      <div className="text-white font-medium">{metrics.count} posts</div>
                      <div className="text-slate-400 text-sm">{metrics.avgEngagement.toFixed(0)} avg engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">Status:</span>
          </div>
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm transition ${filter === "all" ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
          >
            All ({campaign.posts.length})
          </button>
          <button 
            onClick={() => setFilter("published")}
            className={`px-3 py-2 rounded-lg text-sm transition ${filter === "published" ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
          >
            Published ({publishedPosts.length})
          </button>
          <button 
            onClick={() => setFilter("planned")}
            className={`px-3 py-2 rounded-lg text-sm transition ${filter === "planned" ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
          >
            Planned ({plannedPosts.length})
          </button>
          <button 
            onClick={() => setFilter("idea")}
            className={`px-3 py-2 rounded-lg text-sm transition ${filter === "idea" ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
          >
            Ideas ({ideaPosts.length})
          </button>
        </div>

        {/* Character Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">Character:</span>
          </div>
          <button 
            onClick={() => setCharacterFilter(null)}
            className={`px-3 py-2 rounded-lg text-sm transition ${characterFilter === null ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
          >
            All Characters
          </button>
          {SOCIAL_CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => setCharacterFilter(char.id)}
              className={`px-3 py-2 rounded-lg text-sm transition ${characterFilter === char.id ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"}`}
            >
              {char.name}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onEdit={() => setEditingPost(post)}
              onDelete={() => {
                if (confirm("Are you sure you want to delete this post?")) {
                  deletePost(post.id);
                }
              }}
            />
          ))}
        </div>

        {/* Edit Post Dialog */}
        {editingPost && (
          <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit Post</DialogTitle>
              </DialogHeader>
              <AddPostForm 
                initialData={editingPost}
                onSubmit={(postData) => {
                  updatePost(editingPost.id, postData);
                  setEditingPost(null);
                }} 
                onCancel={() => setEditingPost(null)} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, onEdit, onDelete }: { post: any; onEdit: () => void; onDelete: () => void }) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      case "tiktok":
        return <Video className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "planned":
        return "bg-blue-500/20 border-blue-500/50 text-blue-400";
      case "idea":
        return "bg-slate-500/20 border-slate-500/50 text-slate-400";
      default:
        return "bg-slate-500/20 border-slate-500/50 text-slate-400";
    }
  };

  const character = post.characterId 
    ? allProjects.find((p) => p.id === post.characterId) || SOCIAL_CHARACTERS.find((c) => c.id === post.characterId)
    : null;
  
  // Get character image based on content image type
  const getCharacterImage = () => {
    if (!character) return null;
    // Only Project type has image properties
    if ("portrait" in character) {
      switch (post.content.imageType) {
        case "portrait":
          return character.portrait || character.image;
        case "poster":
          return character.poster || character.image;
        case "avatar":
          return character.avatar || character.image;
        default:
          return character.image;
      }
    }
    return null;
  };

  const characterImage = getCharacterImage();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition">
      {/* Image Preview */}
      {characterImage && (
        <div className="relative aspect-square bg-slate-900">
          <img
            src={characterImage}
            alt={character?.name || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900/80 rounded-lg backdrop-blur-sm">
                {getPlatformIcon(post.platform)}
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full border backdrop-blur-sm ${getStatusColor(post.status)}`}>
                {STATUS_LABELS[post.status as keyof typeof STATUS_LABELS]}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-medium">{post.title}</h3>
            <p className="text-slate-400 text-sm">{PLATFORM_LABELS[post.platform as keyof typeof PLATFORM_LABELS]}</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-slate-300 text-sm line-clamp-3">{post.content.caption || post.content.script}</p>
        </div>

        {character && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-1 text-xs text-amber-400">
              <User className="w-3 h-3" />
              {character.name}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{PILLAR_LABELS[post.pillar as keyof typeof PILLAR_LABELS]}</span>
          {post.metrics && (
            <div className="flex items-center gap-3">
              <span>{post.metrics.likes} likes</span>
              <span>{post.metrics.impressions} views</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex-1 text-slate-400 hover:text-white hover:bg-slate-700/50"
            onClick={onEdit}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddPostForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: { 
  initialData?: ContentPost; 
  onSubmit: (data: Omit<ContentPost, "id">) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    platform: initialData?.platform || "instagram",
    status: initialData?.status || "idea",
    pillar: initialData?.pillar || "character-introduction",
    characterId: initialData?.characterId || "",
    templateType: initialData?.templateType || "square",
    content: {
      caption: initialData?.content.caption || "",
      imageType: initialData?.content.imageType || "portrait",
      script: initialData?.content.script || "",
      hashtags: initialData?.content.hashtags?.join(", ") || "",
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      content: {
        ...formData.content,
        hashtags: formData.content.hashtags.split(",").map(t => t.trim()).filter(Boolean),
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value as any })}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="pillar">Content Pillar</Label>
        <Select value={formData.pillar} onValueChange={(value) => setFormData({ ...formData, pillar: value as any })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {Object.entries(PILLAR_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="templateType">Template Type</Label>
        <Select value={formData.templateType} onValueChange={(value) => setFormData({ ...formData, templateType: value as any })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="square">Square Post (1:1)</SelectItem>
            <SelectItem value="story">Story/Reel (9:16)</SelectItem>
            <SelectItem value="banner">Banner (16:9)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="character">Character</Label>
        <Select value={formData.characterId} onValueChange={(value) => setFormData({ ...formData, characterId: value })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select a character" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="">No character</SelectItem>
            {allProjects.map((char) => (
              <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
            ))}
            {SOCIAL_CHARACTERS.map((char) => (
              <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={formData.content.caption}
          onChange={(e) => setFormData({ ...formData, content: { ...formData.content, caption: e.target.value } })}
          className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          required
        />
      </div>

      <div>
        <Label htmlFor="imageType">Image Type</Label>
        <Select value={formData.content.imageType} onValueChange={(value) => setFormData({ ...formData, content: { ...formData.content, imageType: value as any } })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="poster">Poster</SelectItem>
            <SelectItem value="avatar">Avatar</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
        <Input
          id="hashtags"
          value={formData.content.hashtags}
          onChange={(e) => setFormData({ ...formData, content: { ...formData.content, hashtags: e.target.value } })}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="#tag1, #tag2, #tag3"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-slate-800 border-slate-700 text-white">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          {initialData ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
