import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  FileText, 
  DollarSign, 
  Building, 
  Zap,
  ArrowRight,
  ChevronDown,
  Crown,
  BookOpen,
  Layers,
  Users,
  Brain,
  Mic
} from "lucide-react";

export const Route = createFileRoute("/tzu-hierarchy")({
  component: TZUHierarchy,
});

function TZUHierarchy() {
  const depots = [
    {
      code: "TZI.TR.CON",
      name: "Consort Depot",
      subtitle: "Shadow/MEDIA",
      description: "Content creation, social media management, and media production workflows",
      icon: Building2,
      color: "bg-purple-500/10 text-purple-400",
      platforms: ["TikTok", "Instagram", "YouTube", "X (Twitter)"],
      responsibilities: [
        "Content creation pipelines",
        "Social media management",
        "Media production workflows",
        "Creative asset generation"
      ],
      subsidiaries: ["Swagger Dragon Gaming Studios", "Gilded Mirrors Originals", "Rellyvent Media Group"]
    },
    {
      code: "TZI.EST.SCR",
      name: "Scribe Depot",
      subtitle: "HueMan-i-Terry/ESTATE",
      description: "Document management, contract automation, and estate operations",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-400",
      platforms: ["Blog", "Documentation", "SEO"],
      responsibilities: [
        "Document management",
        "Contract automation",
        "Infrastructure monitoring",
        "Estate operations"
      ],
      subsidiaries: ["Niiji Remic", "E.J. REIT"]
    },
    {
      code: "TZI.EST.CSH",
      name: "CashingHouse Depot",
      subtitle: "Tiapma'atzu'/ORACLE",
      description: "Financial tracking, revenue optimization, and payment processing",
      icon: DollarSign,
      color: "bg-green-500/10 text-green-400",
      platforms: ["Gumroad", "Fiverr", "CrakRevenue", "AdMob", "Linktree"],
      responsibilities: [
        "Financial tracking",
        "Revenue optimization",
        "Payment processing",
        "Analytics and reporting"
      ],
      subsidiaries: ["Eternal Justus Interstellar", "Los Mejos"]
    },
    {
      code: "TZI.TR.HLD",
      name: "Holdings Depot",
      subtitle: "Oracle/TIAPMAATZU",
      description: "Asset management, portfolio tracking, and resource allocation",
      icon: Building,
      color: "bg-amber-500/10 text-amber-400",
      platforms: ["Telegram", "WhatsApp", "Adult Content"],
      responsibilities: [
        "Asset management",
        "Portfolio tracking",
        "Investment automation",
        "Resource allocation"
      ],
      subsidiaries: ["Zu Families Initiative", "Zu Clinics", "Zu Hall", "Zu Manors", "Zu Court", "Zu Veils", "Zu Grid, Energy, and Cyber Security", "Zu Wealth", "Zu Factory Output"]
    }
  ];

  const systems = [
    {
      name: "Gnostic Auto-Didactico",
      description: "Self-learning and knowledge acquisition system",
      icon: BookOpen,
      color: "bg-indigo-500/10 text-indigo-400"
    },
    {
      name: "Stakeholder Tracking",
      description: "Comprehensive stakeholder management and relationship tracking",
      icon: Users,
      color: "bg-pink-500/10 text-pink-400"
    },
    {
      name: "Daily Automation",
      description: "Routine task automation and workflow optimization",
      icon: Zap,
      color: "bg-yellow-500/10 text-yellow-400"
    },
    {
      name: "Behavioral Science",
      description: "Behavioral analysis and optimization for user engagement",
      icon: Brain,
      color: "bg-cyan-500/10 text-cyan-400"
    },
    {
      name: "Paats Voice Cloning",
      description: "Voice cloning and audio generation for content creation",
      icon: Mic,
      color: "bg-rose-500/10 text-rose-400"
    }
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
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">TZU Organizational Hierarchy</h1>
              <p className="text-slate-400 mt-1">Tiapma'atzu OS - Integrated Depot System</p>
            </div>
          </div>
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="text-green-400 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Foundation Complete
            </span>
          </div>
        </div>

        {/* Executive Level */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400" />
                Executive Level: TZI.ZI.0.SPIRIT
              </CardTitle>
              <CardDescription className="text-slate-300">
                501(c)(8) - Private Operations | Leadership: ZI (CEO) - 3-year term | Office: Illumiflux of Wisdom
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Hierarchy Flow */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Organizational Flow</h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 font-medium">Executive Level</span>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <span className="text-purple-400 font-medium">Consort Depot</span>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <span className="text-blue-400 font-medium">Scribe Depot</span>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-green-400 font-medium">CashingHouse Depot</span>
              </div>
            </div>
            <ChevronDown className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            <div className="flex-1 text-center">
              <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 font-medium">Holdings Depot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Depot Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Depot Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {depots.map((depot) => (
              <Card key={depot.code} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 ${depot.color} rounded-lg`}>
                        <depot.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{depot.name}</CardTitle>
                        <CardDescription className="text-slate-400">{depot.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{depot.code}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm">{depot.description}</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Platforms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {depot.platforms.map((platform) => (
                        <span key={platform} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Key Responsibilities</h4>
                    <ul className="space-y-1">
                      {depot.responsibilities.map((resp) => (
                        <li key={resp} className="text-slate-400 text-sm flex items-start gap-2">
                          <span className="text-slate-500">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Subsidiaries</h4>
                    <div className="flex flex-wrap gap-2">
                      {depot.subsidiaries.map((sub) => (
                        <span key={sub} className="px-2 py-1 bg-slate-700/30 rounded text-xs text-slate-400">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System-Level Components */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">System-Level Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systems.map((system) => (
              <Card key={system.name} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${system.color} rounded-lg`}>
                      <system.icon className="w-5 h-5" />
                    </div>
                    <div className="text-white font-medium">{system.name}</div>
                  </div>
                  <p className="text-slate-400 text-sm">{system.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Documentation & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium mb-1">Depot Operations</div>
                    <div className="text-slate-400 text-sm">Detailed operational procedures for each depot</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium mb-1">Platform Implementations</div>
                    <div className="text-slate-400 text-sm">Setup guides for all platform integrations</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium mb-1">Automation Frameworks</div>
                    <div className="text-slate-400 text-sm">Technical implementation guides for automation</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium mb-1">Execution Plans</div>
                    <div className="text-slate-400 text-sm">Master index and navigation for all systems</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Status */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Integration Status</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Directory Structure</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Depot Documentation</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Platform Implementations</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">App Integration</span>
                  <span className="text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Automation Implementation</span>
                  <span className="text-amber-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    Pending
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}