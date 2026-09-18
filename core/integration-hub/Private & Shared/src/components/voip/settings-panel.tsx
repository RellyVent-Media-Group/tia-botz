import { useState } from "react";
import { Settings, Save, Plus, Trash2, CheckCircle, XCircle, Phone, Shield, Key, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useVoIPStore } from "@/lib/voip-store";
import type { CPaaSConfig, SIPDevice } from "@/lib/voip-store";

export function SettingsPanel() {
  const cpaasConfigs = useVoIPStore((state) => state.cpaasConfigs);
  const sipDevices = useVoIPStore((state) => state.sipDevices);
  const addCPaaSConfig = useVoIPStore((state) => state.addCPaaSConfig);
  const deleteCPaaSConfig = useVoIPStore((state) => state.deleteCPaaSConfig);
  const toggleCPaaSConfig = useVoIPStore((state) => state.toggleCPaaSConfig);
  const addSIPDevice = useVoIPStore((state) => state.addSIPDevice);
  const deleteSIPDevice = useVoIPStore((state) => state.deleteSIPDevice);
  const toggleSIPDevice = useVoIPStore((state) => state.toggleSIPDevice);

  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isAddSipDeviceOpen, setIsAddSipDeviceOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    provider: "twilio",
    accountSid: "",
    authToken: "",
    webhookBaseUrl: "",
  });
  const [newSipDevice, setNewSipDevice] = useState({
    deviceName: "",
    sipUsername: "",
    sipPassword: "",
    sipServer: "",
    sipPort: 5060,
    transport: "udp",
  });

  const handleAddProvider = () => {
    // Validate required fields
    if (!newProvider.accountSid.trim()) {
      alert("Please enter an Account SID");
      return;
    }
    if (!newProvider.authToken.trim()) {
      alert("Please enter an Auth Token");
      return;
    }

    const config: CPaaSConfig = {
      id: Date.now().toString(),
      provider: newProvider.provider,
      accountSid: newProvider.accountSid,
      enabled: true,
      webhookBaseUrl: newProvider.webhookBaseUrl,
    };
    addCPaaSConfig(config);
    setIsAddProviderOpen(false);
    setNewProvider({ provider: "twilio", accountSid: "", authToken: "", webhookBaseUrl: "" });
  };

  const handleToggleProvider = (id: string) => {
    toggleCPaaSConfig(id);
  };

  const handleDeleteProvider = (id: string) => {
    deleteCPaaSConfig(id);
  };

  const handleAddSipDevice = () => {
    // Validate required fields
    if (!newSipDevice.deviceName.trim()) {
      alert("Please enter a device name");
      return;
    }
    if (!newSipDevice.sipUsername.trim()) {
      alert("Please enter a SIP username");
      return;
    }
    if (!newSipDevice.sipPassword.trim()) {
      alert("Please enter a SIP password");
      return;
    }
    if (!newSipDevice.sipServer.trim()) {
      alert("Please enter a SIP server");
      return;
    }

    const device: SIPDevice = {
      id: Date.now().toString(),
      deviceName: newSipDevice.deviceName,
      sipUsername: newSipDevice.sipUsername,
      sipServer: newSipDevice.sipServer,
      sipPort: newSipDevice.sipPort,
      transport: newSipDevice.transport,
      enabled: true,
    };
    addSIPDevice(device);
    setIsAddSipDeviceOpen(false);
    setNewSipDevice({
      deviceName: "",
      sipUsername: "",
      sipPassword: "",
      sipServer: "",
      sipPort: 5060,
      transport: "udp",
    });
  };

  const handleToggleSipDevice = (id: string) => {
    toggleSIPDevice(id);
  };

  const handleDeleteSipDevice = (id: string) => {
    deleteSIPDevice(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">RellePhone Settings</h2>
        <p className="text-muted-foreground">Configure CPaaS providers and SIP devices</p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">CPaaS Providers</TabsTrigger>
          <TabsTrigger value="sip">SIP Devices</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CPaaS Provider Configuration</CardTitle>
                  <CardDescription>Configure Twilio, Telnyx, or Plivo API credentials</CardDescription>
                </div>
                <Button onClick={() => setIsAddProviderOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cpaasConfigs.map((config) => (
                  <div key={config.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{config.provider}</h4>
                          <p className="text-sm text-muted-foreground">
                            {config.accountSid}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {config.enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm capitalize">
                            {config.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => handleToggleProvider(config.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProvider(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Account SID:</span>
                        <span className="font-mono">{config.accountSid}</span>
                      </div>
                      {config.webhookBaseUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Webhook URL:</span>
                          <span className="font-mono">{config.webhookBaseUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAddProviderOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Provider</CardTitle>
                <CardDescription>Configure a new CPaaS provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select
                      value={newProvider.provider}
                      onValueChange={(value) => setNewProvider({ ...newProvider, provider: value })}
                    >
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
                    <Label htmlFor="accountSid">Account SID</Label>
                    <Input
                      id="accountSid"
                      placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={newProvider.accountSid}
                      onChange={(e) => setNewProvider({ ...newProvider, accountSid: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authToken">Auth Token</Label>
                    <Input
                      id="authToken"
                      type="password"
                      placeholder="Your auth token"
                      value={newProvider.authToken}
                      onChange={(e) => setNewProvider({ ...newProvider, authToken: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookBaseUrl">Webhook Base URL</Label>
                    <Input
                      id="webhookBaseUrl"
                      placeholder="https://your-domain.com/webhooks"
                      value={newProvider.webhookBaseUrl}
                      onChange={(e) => setNewProvider({ ...newProvider, webhookBaseUrl: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProvider}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddProviderOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sip" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SIP Device Configuration</CardTitle>
                  <CardDescription>Configure SIP softphone devices for VoIP calls</CardDescription>
                </div>
                <Button onClick={() => setIsAddSipDeviceOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sipDevices.map((device) => (
                  <div key={device.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{device.deviceName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {device.sipUsername}@{device.sipServer}:{device.sipPort}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {device.enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm capitalize">
                            {device.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <Switch
                          checked={device.enabled}
                          onCheckedChange={() => handleToggleSipDevice(device.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSipDevice(device.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Transport:</span>
                        <span className="uppercase">{device.transport}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAddSipDeviceOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Add SIP Device</CardTitle>
                <CardDescription>Configure a new SIP softphone device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      placeholder="My Phone"
                      value={newSipDevice.deviceName}
                      onChange={(e) => setNewSipDevice({ ...newSipDevice, deviceName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipUsername">SIP Username</Label>
                    <Input
                      id="sipUsername"
                      placeholder="username"
                      value={newSipDevice.sipUsername}
                      onChange={(e) => setNewSipDevice({ ...newSipDevice, sipUsername: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipPassword">SIP Password</Label>
                    <Input
                      id="sipPassword"
                      type="password"
                      placeholder="password"
                      value={newSipDevice.sipPassword}
                      onChange={(e) => setNewSipDevice({ ...newSipDevice, sipPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipServer">SIP Server</Label>
                    <Input
                      id="sipServer"
                      placeholder="sip.provider.com"
                      value={newSipDevice.sipServer}
                      onChange={(e) => setNewSipDevice({ ...newSipDevice, sipServer: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sipPort">SIP Port</Label>
                      <Input
                        id="sipPort"
                        type="number"
                        placeholder="5060"
                        value={newSipDevice.sipPort}
                        onChange={(e) => setNewSipDevice({ ...newSipDevice, sipPort: parseInt(e.target.value) || 5060 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport">Transport</Label>
                      <Select
                        value={newSipDevice.transport}
                        onValueChange={(value) => setNewSipDevice({ ...newSipDevice, transport: value })}
                      >
                        <SelectTrigger id="transport">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddSipDevice}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Device
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddSipDeviceOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure global VoIP system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Call Recording</h4>
                    <p className="text-sm text-muted-foreground">Automatically record all calls</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Call Transcription</h4>
                    <p className="text-sm text-muted-foreground">Transcribe call recordings automatically</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications for missed calls</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Voicemail Transcription</h4>
                    <p className="text-sm text-muted-foreground">Transcribe voicemail messages</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}