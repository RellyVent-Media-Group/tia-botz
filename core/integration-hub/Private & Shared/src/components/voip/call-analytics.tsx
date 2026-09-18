import { useState } from "react";
import { BarChart3, TrendingUp, PhoneCall, Clock, DollarSign, Users, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVoIPStore } from "@/lib/voip-store";

export function CallAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedNumber, setSelectedNumber] = useState("all");

  const getAnalyticsData = useVoIPStore((state) => state.getAnalyticsData);
  const getActivePhoneNumbers = useVoIPStore((state) => state.getActivePhoneNumbers);

  const currentData = getAnalyticsData(timeRange);
  const activePhoneNumbers = getActivePhoneNumbers();

  const formatCost = (dollars: number) => {
    return `$${dollars.toFixed(2)}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const completionRate = ((currentData.completedCalls / currentData.totalCalls) * 100).toFixed(1);
  const avgCostPerCall = (currentData.totalCost / currentData.totalCalls).toFixed(3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">RellePhone Analytics</h2>
          <p className="text-muted-foreground">Track call performance and costs</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedNumber} onValueChange={setSelectedNumber}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Numbers</SelectItem>
              {activePhoneNumbers.map((number) => (
                <SelectItem key={number.id} value={number.number}>
                  {number.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              {currentData.inboundCalls} inbound, {currentData.outboundCalls} outbound
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {currentData.missedCalls} missed calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(currentData.totalDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {currentData.avgDuration}s per call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(currentData.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${avgCostPerCall}/call
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Distribution</CardTitle>
            <CardDescription>Inbound vs outbound calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Inbound Calls</span>
                  <span className="text-sm text-muted-foreground">
                    {currentData.inboundCalls} ({((currentData.inboundCalls / currentData.totalCalls) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(currentData.inboundCalls / currentData.totalCalls) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Outbound Calls</span>
                  <span className="text-sm text-muted-foreground">
                    {currentData.outboundCalls} ({((currentData.outboundCalls / currentData.totalCalls) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${(currentData.outboundCalls / currentData.totalCalls) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Outcomes</CardTitle>
            <CardDescription>Call status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm text-muted-foreground">
                    {currentData.completedCalls} ({completionRate}%)
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Missed</span>
                  <span className="text-sm text-muted-foreground">
                    {currentData.missedCalls} ({((currentData.missedCalls / currentData.totalCalls) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${((currentData.missedCalls / currentData.totalCalls) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Callers</CardTitle>
            <CardDescription>Distinct phone numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-3xl font-bold">{currentData.uniqueCallers}</div>
                <p className="text-sm text-muted-foreground">
                  {((currentData.uniqueCallers / currentData.totalCalls) * 100).toFixed(1)}% repeat calls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Per-call and per-minute costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per call</span>
                <span className="font-medium">${avgCostPerCall}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per minute</span>
                <span className="font-medium">${((currentData.totalCost / (currentData.totalDuration / 60))).toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total duration</span>
                <span className="font-medium">{formatDuration(currentData.totalDuration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}