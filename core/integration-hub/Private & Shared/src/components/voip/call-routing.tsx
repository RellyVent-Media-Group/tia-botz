import { useState } from "react";
import { PhoneCall, PhoneOutgoing, PhoneIncoming, Clock, CheckCircle, XCircle, AlertCircle, Play, Download, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoIPStore } from "@/lib/voip-store";

export function CallRouting() {
  const calls = useVoIPStore((state) => state.calls);
  const deleteCall = useVoIPStore((state) => state.deleteCall);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.fromNumber.includes(searchQuery) ||
      call.toNumber.includes(searchQuery) ||
      call.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCall = (id: string) => {
    deleteCall(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "missed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "ringing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCost = (cents: number) => {
    return `$${(cents / 100).toFixed(3)}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">RellePhone Calls</h2>
        <p className="text-muted-foreground">View and manage call history and routing</p>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Call History</TabsTrigger>
          <TabsTrigger value="routing">Call Routing</TabsTrigger>
          <TabsTrigger value="ivr">IVR Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Call History</CardTitle>
                  <CardDescription>Recent inbound and outbound calls</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search calls..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {call.direction === "inbound" ? (
                          <PhoneIncoming className="h-5 w-5 text-primary" />
                        ) : (
                          <PhoneOutgoing className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{call.fromNumber}</p>
                          <span className="text-muted-foreground">→</span>
                          <p className="font-medium">{call.toNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Via {call.phoneNumber}</span>
                          <span>•</span>
                          <span>{formatTime(call.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(call.status)}
                        <span className="text-sm capitalize">{call.status}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {call.duration > 0 && <span>{formatDuration(call.duration)}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatCost(call.cost)}</div>
                      <div className="flex gap-2">
                        {call.status === "completed" && call.duration > 0 && (
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCall(call.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Routing Rules</CardTitle>
              <CardDescription>Configure how calls are forwarded and distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Business Hours Routing</h4>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Forward calls to +1 (555) 999-8888 during business hours (9 AM - 5 PM)
                  </p>
                  <Button variant="outline" size="sm">Edit Rule</Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">After Hours Routing</h4>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send calls to voicemail outside business hours
                  </p>
                  <Button variant="outline" size="sm">Edit Rule</Button>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Geographic Routing</h4>
                    <span className="text-sm text-muted-foreground">Inactive</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Route calls based on caller location
                  </p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <Button className="w-full">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Add Routing Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ivr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IVR Menus</CardTitle>
              <CardDescription>Configure interactive voice response systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Main Menu</h4>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "Thank you for calling. Press 1 for Sales, 2 for Support, 3 for Billing"
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit Menu</Button>
                    <Button variant="outline" size="sm">Test</Button>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Support Queue</h4>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "Press 1 for Technical Support, 2 for Account Support, 3 to speak with an agent"
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit Menu</Button>
                    <Button variant="outline" size="sm">Test</Button>
                  </div>
                </div>

                <Button className="w-full">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Create IVR Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}