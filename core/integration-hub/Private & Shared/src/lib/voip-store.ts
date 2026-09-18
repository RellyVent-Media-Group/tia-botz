import { create } from 'zustand';

export interface PhoneNumber {
  id: string;
  number: string;
  provider: string;
  type: string;
  status: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  forwardingNumber?: string;
  sipEnabled: boolean;
}

export interface CallLog {
  id: string;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  fromNumber: string;
  toNumber: string;
  status: string;
  duration: number;
  timestamp: Date;
  cost: number;
}

export interface Message {
  id: string;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  fromNumber: string;
  toNumber: string;
  body: string;
  status: string;
  timestamp: Date;
  cost: number;
}

export interface VoicemailMessage {
  id: string;
  phoneNumber: string;
  fromNumber: string;
  recordingUrl: string;
  transcription?: string;
  duration: number;
  listened: boolean;
  timestamp: Date;
}

export interface CPaaSConfig {
  id: string;
  provider: string;
  accountSid: string;
  enabled: boolean;
  webhookBaseUrl: string;
}

export interface SIPDevice {
  id: string;
  deviceName: string;
  sipUsername: string;
  sipServer: string;
  sipPort: number;
  transport: string;
  enabled: boolean;
}

interface VoIPStore {
  phoneNumbers: PhoneNumber[];
  calls: CallLog[];
  messages: Message[];
  voicemails: VoicemailMessage[];
  cpaasConfigs: CPaaSConfig[];
  sipDevices: SIPDevice[];

  // Phone Number actions
  addPhoneNumber: (number: PhoneNumber) => void;
  updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => void;
  deletePhoneNumber: (id: string) => void;
  getActivePhoneNumbers: () => PhoneNumber[];

  // Call actions
  addCall: (call: CallLog) => void;
  updateCall: (id: string, updates: Partial<CallLog>) => void;
  deleteCall: (id: string) => void;

  // Message actions
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;

  // Voicemail actions
  addVoicemail: (voicemail: VoicemailMessage) => void;
  updateVoicemail: (id: string, updates: Partial<VoicemailMessage>) => void;
  deleteVoicemail: (id: string) => void;
  markVoicemailAsListened: (id: string) => void;

  // Settings actions
  addCPaaSConfig: (config: CPaaSConfig) => void;
  updateCPaaSConfig: (id: string, updates: Partial<CPaaSConfig>) => void;
  deleteCPaaSConfig: (id: string) => void;
  toggleCPaaSConfig: (id: string) => void;

  addSIPDevice: (device: SIPDevice) => void;
  updateSIPDevice: (id: string, updates: Partial<SIPDevice>) => void;
  deleteSIPDevice: (id: string) => void;
  toggleSIPDevice: (id: string) => void;

  // Analytics helpers
  getAnalyticsData: (timeRange: string) => {
    totalCalls: number;
    inboundCalls: number;
    outboundCalls: number;
    completedCalls: number;
    missedCalls: number;
    totalDuration: number;
    totalCost: number;
    uniqueCallers: number;
    avgDuration: number;
  };
}

const initialPhoneNumbers: PhoneNumber[] = [
  {
    id: "1",
    number: "+1 (555) 123-4567",
    provider: "twilio",
    type: "local",
    status: "active",
    capabilities: { voice: true, sms: true, mms: false },
    forwardingNumber: "+1 (555) 999-8888",
    sipEnabled: false,
  },
  {
    id: "2",
    number: "+1 (555) 987-6543",
    provider: "telnyx",
    type: "tollfree",
    status: "active",
    capabilities: { voice: true, sms: true, mms: true },
    sipEnabled: true,
  },
  {
    id: "3",
    number: "+1 (555) 456-7890",
    provider: "plivo",
    type: "local",
    status: "inactive",
    capabilities: { voice: true, sms: true, mms: false },
    forwardingNumber: undefined,
    sipEnabled: false,
  },
];

const initialCalls: CallLog[] = [
  {
    id: "1",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    fromNumber: "+1 (555) 999-8888",
    toNumber: "+1 (555) 123-4567",
    status: "completed",
    duration: 325,
    timestamp: new Date(Date.now() - 300000),
    cost: 0.024,
  },
  {
    id: "2",
    phoneNumber: "+1 (555) 987-6543",
    direction: "outbound",
    fromNumber: "+1 (555) 987-6543",
    toNumber: "+1 (555) 111-2222",
    status: "completed",
    duration: 180,
    timestamp: new Date(Date.now() - 1800000),
    cost: 0.018,
  },
  {
    id: "3",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    fromNumber: "+1 (555) 333-4444",
    toNumber: "+1 (555) 123-4567",
    status: "missed",
    duration: 0,
    timestamp: new Date(Date.now() - 3600000),
    cost: 0.005,
  },
  {
    id: "4",
    phoneNumber: "+1 (555) 456-7890",
    direction: "outbound",
    fromNumber: "+1 (555) 456-7890",
    toNumber: "+1 (555) 555-6666",
    status: "failed",
    duration: 0,
    timestamp: new Date(Date.now() - 7200000),
    cost: 0,
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    fromNumber: "+1 (555) 999-8888",
    toNumber: "+1 (555) 123-4567",
    body: "Hi, I'm interested in your services. Can you call me back?",
    status: "delivered",
    timestamp: new Date(Date.now() - 300000),
    cost: 0.008,
  },
  {
    id: "2",
    phoneNumber: "+1 (555) 987-6543",
    direction: "outbound",
    fromNumber: "+1 (555) 987-6543",
    toNumber: "+1 (555) 111-2222",
    body: "Your appointment is confirmed for tomorrow at 2 PM.",
    status: "delivered",
    timestamp: new Date(Date.now() - 1800000),
    cost: 0.012,
  },
  {
    id: "3",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    fromNumber: "+1 (555) 333-4444",
    toNumber: "+1 (555) 123-4567",
    body: "STOP",
    status: "delivered",
    timestamp: new Date(Date.now() - 3600000),
    cost: 0.008,
  },
  {
    id: "4",
    phoneNumber: "+1 (555) 456-7890",
    direction: "outbound",
    fromNumber: "+1 (555) 456-7890",
    toNumber: "+1 (555) 555-6666",
    body: "Special offer: 50% off this weekend only!",
    status: "failed",
    timestamp: new Date(Date.now() - 7200000),
    cost: 0,
  },
];

const initialVoicemails: VoicemailMessage[] = [
  {
    id: "1",
    phoneNumber: "+1 (555) 123-4567",
    fromNumber: "+1 (555) 999-8888",
    recordingUrl: "https://example.com/recording1.mp3",
    transcription: "Hi, this is John calling about the project. I wanted to discuss the timeline and deliverables. Please give me a call back when you get a chance.",
    duration: 45,
    listened: false,
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    phoneNumber: "+1 (555) 987-6543",
    fromNumber: "+1 (555) 111-2222",
    recordingUrl: "https://example.com/recording2.mp3",
    transcription: "This is Sarah from accounting. I need to confirm the invoice details for last month. The total seems to be incorrect.",
    duration: 32,
    listened: true,
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "3",
    phoneNumber: "+1 (555) 123-4567",
    fromNumber: "+1 (555) 333-4444",
    recordingUrl: "https://example.com/recording3.mp3",
    transcription: undefined,
    duration: 28,
    listened: false,
    timestamp: new Date(Date.now() - 3600000),
  },
];

const initialCPaaSConfigs: CPaaSConfig[] = [
  {
    id: "1",
    provider: "twilio",
    accountSid: "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    enabled: true,
    webhookBaseUrl: "https://your-domain.com/webhooks",
  },
  {
    id: "2",
    provider: "telnyx",
    accountSid: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    enabled: false,
    webhookBaseUrl: "",
  },
];

const initialSIPDevices: SIPDevice[] = [
  {
    id: "1",
    deviceName: "Mobile Phone",
    sipUsername: "user1",
    sipServer: "sip.telnyx.com",
    sipPort: 5060,
    transport: "udp",
    enabled: true,
  },
];

export const useVoIPStore = create<VoIPStore>((set, get) => ({
  phoneNumbers: initialPhoneNumbers,
  calls: initialCalls,
  messages: initialMessages,
  voicemails: initialVoicemails,
  cpaasConfigs: initialCPaaSConfigs,
  sipDevices: initialSIPDevices,

  // Phone Number actions
  addPhoneNumber: (number) => set((state) => ({ phoneNumbers: [...state.phoneNumbers, number] })),
  updatePhoneNumber: (id, updates) => set((state) => ({
    phoneNumbers: state.phoneNumbers.map((num) => (num.id === id ? { ...num, ...updates } : num))
  })),
  deletePhoneNumber: (id) => set((state) => ({ phoneNumbers: state.phoneNumbers.filter((num) => num.id !== id) })),
  getActivePhoneNumbers: () => get().phoneNumbers.filter((num) => num.status === "active"),

  // Call actions
  addCall: (call) => set((state) => ({ calls: [call, ...state.calls] })),
  updateCall: (id, updates) => set((state) => ({
    calls: state.calls.map((call) => (call.id === id ? { ...call, ...updates } : call))
  })),
  deleteCall: (id) => set((state) => ({ calls: state.calls.filter((call) => call.id !== id) })),

  // Message actions
  addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
  })),
  deleteMessage: (id) => set((state) => ({ messages: state.messages.filter((msg) => msg.id !== id) })),

  // Voicemail actions
  addVoicemail: (voicemail) => set((state) => ({ voicemails: [voicemail, ...state.voicemails] })),
  updateVoicemail: (id, updates) => set((state) => ({
    voicemails: state.voicemails.map((vm) => (vm.id === id ? { ...vm, ...updates } : vm))
  })),
  deleteVoicemail: (id) => set((state) => ({ voicemails: state.voicemails.filter((vm) => vm.id !== id) })),
  markVoicemailAsListened: (id) => set((state) => ({
    voicemails: state.voicemails.map((vm) => (vm.id === id ? { ...vm, listened: true } : vm))
  })),

  // Settings actions
  addCPaaSConfig: (config) => set((state) => ({ cpaasConfigs: [...state.cpaasConfigs, config] })),
  updateCPaaSConfig: (id, updates) => set((state) => ({
    cpaasConfigs: state.cpaasConfigs.map((config) => (config.id === id ? { ...config, ...updates } : config))
  })),
  deleteCPaaSConfig: (id) => set((state) => ({ cpaasConfigs: state.cpaasConfigs.filter((config) => config.id !== id) })),
  toggleCPaaSConfig: (id) => set((state) => ({
    cpaasConfigs: state.cpaasConfigs.map((config) =>
      config.id === id ? { ...config, enabled: !config.enabled } : config
    )
  })),

  addSIPDevice: (device) => set((state) => ({ sipDevices: [...state.sipDevices, device] })),
  updateSIPDevice: (id, updates) => set((state) => ({
    sipDevices: state.sipDevices.map((device) => (device.id === id ? { ...device, ...updates } : device))
  })),
  deleteSIPDevice: (id) => set((state) => ({ sipDevices: state.sipDevices.filter((device) => device.id !== id) })),
  toggleSIPDevice: (id) => set((state) => ({
    sipDevices: state.sipDevices.map((device) =>
      device.id === id ? { ...device, enabled: !device.enabled } : device
    )
  })),

  // Analytics helpers
  getAnalyticsData: (timeRange) => {
    const state = get();
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    const filteredCalls = state.calls.filter((call) => call.timestamp >= cutoffDate);

    const totalCalls = filteredCalls.length;
    const inboundCalls = filteredCalls.filter((call) => call.direction === "inbound").length;
    const outboundCalls = filteredCalls.filter((call) => call.direction === "outbound").length;
    const completedCalls = filteredCalls.filter((call) => call.status === "completed").length;
    const missedCalls = filteredCalls.filter((call) => call.status === "missed").length;
    const totalDuration = filteredCalls.reduce((sum, call) => sum + call.duration, 0);
    const totalCost = filteredCalls.reduce((sum, call) => sum + call.cost, 0);
    const uniqueCallers = new Set(filteredCalls.map((call) => call.fromNumber)).size;
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    return {
      totalCalls,
      inboundCalls,
      outboundCalls,
      completedCalls,
      missedCalls,
      totalDuration,
      totalCost,
      uniqueCallers,
      avgDuration,
    };
  },
}));