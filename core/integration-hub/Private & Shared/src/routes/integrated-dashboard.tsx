import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SAMPLE_CAMPAIGN } from "@/lib/content-calendar";
import { projects } from "@/lib/catalog";
import { SOCIAL_CHARACTERS } from "@/lib/social-characters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Bot, 
  Smartphone, 
  Globe, 
  Zap,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  XCircle,
  Star,
  Crown
} from "lucide-react";

export const Route = createFileRoute("/integrated-dashboard")({
  component: IntegratedDashboard,
});

function IntegratedDashboard() {
  // Calculate metrics
  const totalCharacters = projects.length + SOCIAL_CHARACTERS.length;
  const totalPosts = SAMPLE_CAMPAIGN.posts.length;
  const publishedPosts = SAMPLE_CAMPAIGN.posts.filter(p => p.status === 'published').length;
  const plannedPosts = SAMPLE_CAMPAIGN.posts.filter(p => p.status === 'planned').length;
  const ideaPosts = SAMPLE_CAMPAIGN.posts.filter(p => p.status === 'idea').length;
  
  const totalImpressions = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.impressions || 0), 0);
  const totalEngagement = SAMPLE_CAMPAIGN.posts.reduce((sum, post) => sum + (post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0), 0);
  const engagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : 0;

  // Character asset metrics (simulated data - in production this would come from the actual CSV)
  const characterAssetMetrics = {
    totalCharacters: 46,
    completeAssets: 11,
    partialAssets: 0,
    noAssets: 35,
    legendaryCharacters: 11,
    rareCharacters: 15,
    commonCharacters: 4,
    rareSoulCharacters: 16
  };

  const assetCompletionRate = ((characterAssetMetrics.completeAssets / characterAssetMetrics.totalCharacters) * 100).toFixed(1);

  // System status
  const systems = [
    { name: 'Workspace Web App', status: 'online', icon: Globe, url: 'http://localhost:8080' },
    { name: 'WhatsApp Bot', status: 'online', icon: Smartphone, url: 'whatsapp-bot' },
    { name: 'Telegram Bot', status: 'online', icon: Bot, url: 'telegram-bot' },
    { name: 'Social Media Automation', status: 'online', icon: Zap, url: 'social-media' },
    { name: 'Notion Sync', status: 'online', icon: Calendar, url: 'notion-sync' },
    { name: 'Visual Assets Generator', status: 'online', icon: TrendingUp, url: 'visual-assets' },
  ];

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="grain" aria-hidden="true" />
      <SiteNav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Globe className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Integrated Ecosystem Dashboard</h1>
              <p className="text-slate-400 mt-1">Unified view of all connected systems</p>
            </div>
          </div>
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="text-green-400 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Total Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{characterAssetMetrics.totalCharacters}</div>
                  <div className="text-slate-400 text-sm">In database</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Asset Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{assetCompletionRate}%</div>
                  <div className="text-slate-400 text-sm">{characterAssetMetrics.completeAssets} complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Legendary Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{characterAssetMetrics.legendaryCharacters}</div>
                  <div className="text-slate-400 text-sm">All assets generated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Need Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{characterAssetMetrics.noAssets}</div>
                  <div className="text-slate-400 text-sm">Characters pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Character Asset Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Character Asset Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Crown className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Legendary</div>
                      <div className="text-slate-400 text-sm">{characterAssetMetrics.legendaryCharacters} characters</div>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="text-xs text-green-400 mt-2">100% complete</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Star className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Rare</div>
                      <div className="text-slate-400 text-sm">{characterAssetMetrics.rareCharacters} characters</div>
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="text-xs text-red-400 mt-2">0% complete</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Common</div>
                      <div className="text-slate-400 text-sm">{characterAssetMetrics.commonCharacters} characters</div>
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="text-xs text-red-400 mt-2">0% complete</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Rare Soul</div>
                      <div className="text-slate-400 text-sm">{characterAssetMetrics.rareSoulCharacters} characters</div>
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="text-xs text-red-400 mt-2">0% complete</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((system) => (
              <Card key={system.name} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <system.icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{system.name}</div>
                        <div className="text-slate-400 text-sm capitalize">{system.status}</div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Content Pipeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Content Pipeline Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Ideas
                </CardTitle>
                <CardDescription className="text-slate-400">Content concepts and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{ideaPosts}</div>
                <div className="text-slate-400 text-sm">Ready for development</div>
                <Button variant="outline" size="sm" className="w-full mt-4 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                  View Ideas
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Planned
                </CardTitle>
                <CardDescription className="text-slate-400">Scheduled for publication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{plannedPosts}</div>
                <div className="text-slate-400 text-sm">In production queue</div>
                <Button variant="outline" size="sm" className="w-full mt-4 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                  View Schedule
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Published
                </CardTitle>
                <CardDescription className="text-slate-400">Live across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{publishedPosts}</div>
                <div className="text-slate-400 text-sm">Currently active</div>
                <Button variant="outline" size="sm" className="w-full mt-4 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                  View Published
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Points */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Active Integrations</h2>
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Smartphone className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">WhatsApp Bot Integration</div>
                      <div className="text-slate-400 text-sm">Character database access, prompt generation, engagement sync</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Telegram Bot Integration</div>
                      <div className="text-slate-400 text-sm">Parallel messaging, character prompts, user sessions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Social Media Automation</div>
                      <div className="text-slate-400 text-sm">Instagram & TikTok posting, content calendar sync</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Notion Sync</div>
                      <div className="text-slate-400 text-sm">Character database sync, content calendar, task management</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-auto py-4"
              onClick={() => window.location.href = '/character-database'}
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span>Character Database</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-auto py-4"
              onClick={() => window.location.href = '/content-calendar'}
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-6 h-6" />
                <span>Content Calendar</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-auto py-4"
              onClick={() => window.location.href = '/social-templates'}
            >
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6" />
                <span>Social Templates</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-auto py-4"
              onClick={() => window.location.href = '/'}
            >
              <div className="flex flex-col items-center gap-2">
                <Globe className="w-6 h-6" />
                <span>Main Catalog</span>
              </div>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}