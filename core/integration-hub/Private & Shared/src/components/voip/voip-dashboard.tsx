import { useState } from "react";
import { Phone, MessageSquare, Voicemail, Settings, BarChart3, Plus, PhoneCall, Clock, DollarSign, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneNumberManagement } from "./phone-number-management";
import { CallAnalytics } from "./call-analytics";
import { MessageCenter } from "./message-center";
import { VoicemailCenter } from "./voicemail-center";
import { CallRouting } from "./call-routing";
import { SettingsPanel } from "./settings-panel";
import { useVoIPStore } from "@/lib/voip-store";

export function VoIPDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const phoneNumbers = useVoIPStore((state) => state.phoneNumbers);
  const calls = useVoIPStore((state) => state.calls);
  const messages = useVoIPStore((state) => state.messages);
  const voicemails = useVoIPStore((state) => state.voicemails);
  const getActivePhoneNumbers = useVoIPStore((state) => state.getActivePhoneNumbers);
  const getAnalyticsData = useVoIPStore((state) => state.getAnalyticsData);
  const addPhoneNumber = useVoIPStore((state) => state.addPhoneNumber);

  const activeNumbers = getActivePhoneNumbers();
  const todayAnalytics = getAnalyticsData("7d");
  
  // Calculate today's specific metrics
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayCalls = calls.filter(call => call.timestamp >= startOfDay);
  const todayMessages = messages.filter(message => message.timestamp >= startOfDay);
  const todayVoicemails = voicemails.filter(vm => vm.timestamp >= startOfDay && !vm.listened);
  
  const calculateTodayCost = () => {
    const todayCallCost = todayCalls.reduce((sum, call) => sum + call.cost, 0);
    const todayMessageCost = todayMessages.reduce((sum, msg) => sum + msg.cost, 0);
    return todayCallCost + todayMessageCost;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">RellePhone Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your phone system and communications</p>
            </div>
            <Button onClick={() => setActiveTab("numbers")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Number
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="numbers" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Numbers
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="routing" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Routing
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="voicemail" className="flex items-center gap-2">
              <Voicemail className="h-4 w-4" />
              Voicemail
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Numbers</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeNumbers.length}</div>
                  <p className="text-xs text-muted-foreground">{phoneNumbers.length - activeNumbers.length} inactive</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayCalls.length}</div>
                  <p className="text-xs text-muted-foreground">{todayCalls.filter(c => c.status === "completed").length} completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayMessages.length}</div>
                  <p className="text-xs text-muted-foreground">{todayMessages.filter(m => m.status === "delivered").length} delivered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${calculateTodayCost().toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{todayAnalytics.totalCalls} calls this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest calls and messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...calls.slice(0, 2), ...messages.slice(0, 2)]
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .slice(0, 4)
                      .map((item) => {
                        const isCall = 'direction' in item && 'status' in item && 'duration' in item;
                        const timeAgo = Math.floor((now.getTime() - item.timestamp.getTime()) / 60000);
                        const uniqueKey = isCall ? `call-${item.id}` : `message-${item.id}`;

                        return (
                          <div key={uniqueKey} className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                {isCall ? (
                                  <PhoneCall className="h-5 w-5 text-primary" />
                                ) : (
                                  <MessageSquare className="h-5 w-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{isCall ? (item as any).fromNumber : (item as any).fromNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {isCall ?
                                    `${(item as any).direction === 'inbound' ? 'Incoming' : 'Outgoing'} call • ${timeAgo} min ago` :
                                    `SMS received • ${timeAgo} min ago`
                                  }
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm ${
                              isCall ?
                                (item as any).status === 'completed' ? 'text-green-500' :
                                (item as any).status === 'missed' ? 'text-red-500' : 'text-yellow-500' :
                                (item as any).status === 'delivered' ? 'text-green-500' : 'text-blue-500'
                            }`}>
                              {isCall ? (item as any).status : (item as any).status}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("calls")}>
                      <PhoneCall className="mr-2 h-4 w-4" />
                      View Call History
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("messages")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("voicemail")}>
                      <Voicemail className="mr-2 h-4 w-4" />
                      Check Voicemail {todayVoicemails.length > 0 && `(${todayVoicemails.length})`}
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveTab("settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="numbers">
            <PhoneNumberManagement />
          </TabsContent>

          <TabsContent value="calls">
            <CallAnalytics />
          </TabsContent>

          <TabsContent value="routing">
            <CallRouting />
          </TabsContent>

          <TabsContent value="messages">
            <MessageCenter />
          </TabsContent>

          <TabsContent value="voicemail">
            <VoicemailCenter />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}