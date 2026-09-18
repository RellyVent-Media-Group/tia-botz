import { useState } from "react";
import { MessageSquare, Send, Reply, Trash2, Check, Clock, AlertCircle, Search, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVoIPStore } from "@/lib/voip-store";

export function MessageCenter() {
  const messages = useVoIPStore((state) => state.messages);
  const addMessage = useVoIPStore((state) => state.addMessage);
  const deleteMessage = useVoIPStore((state) => state.deleteMessage);
  const getActivePhoneNumbers = useVoIPStore((state) => state.getActivePhoneNumbers);
  const activePhoneNumbers = getActivePhoneNumbers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    toNumber: "",
    body: "",
    fromNumber: "+1 (555) 123-4567",
  });

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.fromNumber.includes(searchQuery) ||
      message.toNumber.includes(searchQuery) ||
      message.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <Check className="h-4 w-4 text-green-500" />;
      case "sent":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "queued":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
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

  const handleSendMessage = () => {
    // Validate message content
    if (!newMessage.body.trim()) {
      alert("Please enter a message");
      return;
    }
    if (!newMessage.toNumber.trim()) {
      alert("Please enter a recipient number");
      return;
    }

    const message = {
      id: Date.now().toString(),
      phoneNumber: newMessage.fromNumber,
      direction: "outbound" as const,
      fromNumber: newMessage.fromNumber,
      toNumber: newMessage.toNumber,
      body: newMessage.body,
      status: "queued",
      timestamp: new Date(),
      cost: 0.012,
    };
    addMessage(message);
    setIsComposeOpen(false);
    setNewMessage({ toNumber: "", body: "", fromNumber: "+1 (555) 123-4567" });
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">RellePhone Messages</h2>
          <p className="text-muted-foreground">Send and receive SMS messages</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send SMS</DialogTitle>
              <DialogDescription>Send a new SMS message</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Number</label>
                <Select
                  value={newMessage.fromNumber}
                  onValueChange={(value) => setNewMessage({ ...newMessage, fromNumber: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activePhoneNumbers.map((number) => (
                      <SelectItem key={number.id} value={number.number}>
                        {number.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Number</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={newMessage.toNumber}
                  onChange={(e) => setNewMessage({ ...newMessage, toNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                  rows={4}
                  maxLength={1600}
                />
                <p className="text-xs text-muted-foreground">
                  {newMessage.body.length}/1600 characters
                </p>
              </div>
              <Button onClick={handleSendMessage} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Incoming and outgoing SMS</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors ${
                  message.direction === "outbound" ? "ml-8" : "mr-8"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{message.fromNumber}</p>
                        <span className="text-muted-foreground">→</span>
                        <p className="font-medium">{message.toNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Via {message.phoneNumber}</span>
                        <span>•</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <span className="text-sm capitalize">{message.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatCost(message.cost)}</div>
                  </div>
                </div>
                <p className="text-sm mb-3">{message.body}</p>
                <div className="flex gap-2">
                  {message.direction === "inbound" && (
                    <Button variant="ghost" size="sm">
                      <Reply className="mr-1 h-3 w-3" />
                      Reply
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <PhoneCall className="mr-1 h-3 w-3" />
                    Call
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}