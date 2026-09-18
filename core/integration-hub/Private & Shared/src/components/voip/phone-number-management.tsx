import { useState } from "react";
import { Phone, Plus, MoreVertical, Edit, Trash2, PhoneCall, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVoIPStore } from "@/lib/voip-store";

export function PhoneNumberManagement() {
  const phoneNumbers = useVoIPStore((state) => state.phoneNumbers);
  const addPhoneNumber = useVoIPStore((state) => state.addPhoneNumber);
  const deletePhoneNumber = useVoIPStore((state) => state.deletePhoneNumber);
  const getActivePhoneNumbers = useVoIPStore((state) => state.getActivePhoneNumbers);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNumber, setNewNumber] = useState({
    provider: "twilio",
    type: "local",
    areaCode: "",
  });

  const handleAddNumber = () => {
    // Validate area code input
    if (newNumber.areaCode.length < 6) {
      alert("Please enter a valid 6-digit area code");
      return;
    }

    const phoneNumber = {
      id: Date.now().toString(),
      number: `+1 (${newNumber.areaCode.slice(0, 3)}) ${newNumber.areaCode.slice(3, 6)}-${newNumber.areaCode.slice(6)}`,
      provider: newNumber.provider,
      type: newNumber.type,
      status: "active",
      capabilities: { voice: true, sms: true, mms: newNumber.type === "tollfree" },
      sipEnabled: false,
    };
    addPhoneNumber(phoneNumber);
    setIsAddDialogOpen(false);
    setNewNumber({ provider: "twilio", type: "local", areaCode: "" });
  };

  const handleDeleteNumber = (id: string) => {
    deletePhoneNumber(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "porting":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">RellePhone Numbers</h2>
          <p className="text-muted-foreground">Manage your virtual phone numbers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Phone Number</DialogTitle>
              <DialogDescription>Configure a new virtual number from your CPaaS provider</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={newNumber.provider} onValueChange={(value) => setNewNumber({ ...newNumber, provider: value })}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="telnyx">Telnyx</SelectItem>
                    <SelectItem value="plivo">Plivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Number Type</Label>
                <Select value={newNumber.type} onValueChange={(value) => setNewNumber({ ...newNumber, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Number (~$1/mo)</SelectItem>
                    <SelectItem value="tollfree">Toll-Free (~$2/mo)</SelectItem>
                    <SelectItem value="mobile">Mobile Number (~$3/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code (Optional)</Label>
                <Input
                  id="areaCode"
                  placeholder="555123"
                  value={newNumber.areaCode}
                  onChange={(e) => setNewNumber({ ...newNumber, areaCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">Enter 6 digits (area code + prefix)</p>
              </div>
              <Button onClick={handleAddNumber} className="w-full">
                Purchase Number
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phoneNumbers.map((phoneNumber) => (
          <Card key={phoneNumber.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{phoneNumber.number}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(phoneNumber.status)}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="capitalize">{phoneNumber.provider}</span>
                <span>•</span>
                <span className="capitalize">{phoneNumber.type}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Voice:</span>
                  <span className={phoneNumber.capabilities.voice ? "text-green-500" : "text-red-500"}>
                    {phoneNumber.capabilities.voice ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SMS:</span>
                  <span className={phoneNumber.capabilities.sms ? "text-green-500" : "text-red-500"}>
                    {phoneNumber.capabilities.sms ? "Enabled" : "Disabled"}
                  </span>
                </div>
                {phoneNumber.forwardingNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Forwards to:</span>
                    <span className="text-foreground">{phoneNumber.forwardingNumber}</span>
                  </div>
                )}
                {phoneNumber.sipEnabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">SIP:</span>
                    <span className="text-green-500">Enabled</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-3 w-3" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteNumber(phoneNumber.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Release
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}