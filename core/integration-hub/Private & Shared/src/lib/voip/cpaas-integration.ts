// CPaaS Provider Integration
// Handles API calls to Twilio, Telnyx, and Plivo

export interface CPaaSProvider {
  name: "twilio" | "telnyx" | "plivo";
  accountSid: string;
  authToken: string; // For Telnyx, this is the API key; for Twilio/Plivo, it's the auth token
  webhookBaseUrl?: string;
  connectionId?: string; // Telnyx Call Control App connection ID
}

export interface PhoneNumber {
  id: string;
  number: string;
  provider: string;
  type: "local" | "tollfree" | "mobile";
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

export interface CallOptions {
  to: string;
  from: string;
  url?: string; // TwiML or webhook URL
  method?: "GET" | "POST";
  statusCallback?: string;
  statusCallbackEvent?: string[];
}

export interface MessageOptions {
  to: string;
  from: string;
  body: string;
  mediaUrls?: string[];
}

export class CPaaSIntegration {
  private provider: CPaaSProvider;

  constructor(provider: CPaaSProvider) {
    this.provider = provider;
  }

  private get authHeader() {
    // Telnyx uses Bearer token (API key), Twilio and Plivo use Basic auth
    if (this.provider.name === "telnyx") {
      return {
        Authorization: `Bearer ${this.provider.authToken}`,
      };
    }
    return {
      Authorization: `Basic ${btoa(`${this.provider.accountSid}:${this.provider.authToken}`)}`,
    };
  }

  // Phone Number Management
  async purchaseNumber(type: "local" | "tollfree" = "local", areaCode?: string): Promise<PhoneNumber> {
    switch (this.provider.name) {
      case "twilio":
        return this.purchaseTwilioNumber(type, areaCode);
      case "telnyx":
        return this.purchaseTelnyxNumber(type, areaCode);
      case "plivo":
        return this.purchasePlivoNumber(type, areaCode);
      default:
        throw new Error(`Unsupported provider: ${this.provider.name}`);
    }
  }

  private async purchaseTwilioNumber(type: string, areaCode?: string): Promise<PhoneNumber> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.provider.accountSid}/IncomingPhoneNumbers.json`;
    
    const params = new URLSearchParams();
    if (areaCode) {
      params.append("AreaCode", areaCode);
    }
    if (type === "tollfree") {
      params.append("PhoneNumber", `+1${this.generateTollFreeNumber()}`);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader,
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to purchase Twilio number: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.sid,
      number: data.phone_number,
      provider: "twilio",
      type: (data.phone_number.startsWith("+1") && data.phone_number.length === 12 ? "local" : "tollfree") as "local" | "tollfree" | "mobile",
      capabilities: {
        voice: data.capabilities.voice === "true",
        sms: data.capabilities.sms === "true",
        mms: data.capabilities.mms === "true",
      },
    };
  }

  private async purchaseTelnyxNumber(type: string, areaCode?: string): Promise<PhoneNumber> {
    // First search for available numbers
    const searchUrl = "https://api.telnyx.com/v2/available_phone_number_blocks";
    const searchParams = new URLSearchParams();
    searchParams.append("phone_number_type", type === "tollfree" ? "toll-free" : "local");
    searchParams.append("country_code", "US");
    searchParams.append("limit", "1");
    if (areaCode) {
      searchParams.append("area_code", areaCode);
    }

    const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`, {
      method: "GET",
      headers: this.authHeader,
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search Telnyx numbers: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    if (!searchData.data || searchData.data.length === 0) {
      throw new Error("No available Telnyx numbers found");
    }

    // Then purchase the number
    const orderUrl = "https://api.telnyx.com/v2/number_orders";
    const orderBody = {
      phone_number_type: type === "tollfree" ? "toll-free" : "local",
      quantity: 1,
      area_code: areaCode,
    };

    const orderResponse = await fetch(orderUrl, {
      method: "POST",
      headers: {
        ...this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderBody),
    });

    if (!orderResponse.ok) {
      throw new Error(`Failed to purchase Telnyx number: ${orderResponse.statusText}`);
    }

    const orderData = await orderResponse.json();
    return {
      id: orderData.data.id,
      number: orderData.data.phone_numbers?.[0]?.phone_number || searchData.data[0].phone_number,
      provider: "telnyx",
      type: type as "local" | "tollfree" | "mobile",
      capabilities: {
        voice: true,
        sms: true,
        mms: type === "tollfree",
      },
    };
  }

  private async purchasePlivoNumber(type: string, areaCode?: string): Promise<PhoneNumber> {
    // Search for available numbers
    const searchUrl = `https://api.plivo.com/v1/Account/${this.provider.accountSid}/PhoneNumber/`;
    const searchParams = new URLSearchParams();
    searchParams.append("country_iso", "US"); // Required parameter
    searchParams.append("type", type === "tollfree" ? "tollfree" : "local");
    searchParams.append("services", "voice,sms"); // Filter by capabilities
    if (areaCode) {
      searchParams.append("pattern", areaCode); // Use pattern for area code matching
    }
    searchParams.append("limit", "1");

    const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`, {
      method: "GET",
      headers: this.authHeader,
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search Plivo numbers: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    if (!searchData.objects || searchData.objects.length === 0) {
      throw new Error("No available Plivo numbers found");
    }

    const selectedNumber = searchData.objects[0];

    // Purchase the number
    const purchaseUrl = `https://api.plivo.com/v1/Account/${this.provider.accountSid}/PhoneNumber/${selectedNumber.number}/`;
    const purchaseResponse = await fetch(purchaseUrl, {
      method: "POST",
      headers: this.authHeader,
    });

    if (!purchaseResponse.ok) {
      const errorData = await purchaseResponse.json().catch(() => ({}));
      throw new Error(`Failed to purchase Plivo number: ${purchaseResponse.statusText} - ${JSON.stringify(errorData)}`);
    }

    const purchaseData = await purchaseResponse.json();

    return {
      id: selectedNumber.number,
      number: selectedNumber.number,
      provider: "plivo",
      type: (selectedNumber.sub_type === "tollfree" ? "tollfree" : selectedNumber.sub_type === "mobile" ? "mobile" : "local") as "local" | "tollfree" | "mobile",
      capabilities: {
        voice: selectedNumber.voice_enabled || false,
        sms: selectedNumber.sms_enabled || false,
        mms: selectedNumber.mms_enabled || false,
      },
    };
  }

  // Call Management
  async initiateCall(options: CallOptions): Promise<string> {
    switch (this.provider.name) {
      case "twilio":
        return this.initiateTwilioCall(options);
      case "telnyx":
        return this.initiateTelnyxCall(options);
      case "plivo":
        return this.initiatePlivoCall(options);
      default:
        throw new Error(`Unsupported provider: ${this.provider.name}`);
    }
  }

  private async initiateTwilioCall(options: CallOptions): Promise<string> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.provider.accountSid}/Calls.json`;
    
    const params = new URLSearchParams();
    params.append("To", options.to);
    params.append("From", options.from);
    if (options.url) {
      params.append("Url", options.url);
    }
    if (options.method) {
      params.append("Method", options.method);
    }
    if (options.statusCallback) {
      params.append("StatusCallback", options.statusCallback);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader,
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate Twilio call: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sid;
  }

  private async initiateTelnyxCall(options: CallOptions): Promise<string> {
    const url = "https://api.telnyx.com/v2/calls";

    // Ensure phone numbers are in E.164 format
    const formatE164 = (number: string) => {
      if (!number.startsWith("+")) {
        return `+${number.replace(/\D/g, "")}`;
      }
      return number;
    };

    const body = {
      from: formatE164(options.from),
      to: formatE164(options.to),
      connection_id: this.provider.connectionId || this.provider.accountSid,
      webhook_url: options.url || this.provider.webhookBaseUrl,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to initiate Telnyx call: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data.call_control_id;
  }

  private async initiatePlivoCall(options: CallOptions): Promise<string> {
    const url = `https://api.plivo.com/v1/Account/${this.provider.accountSid}/Call/`;

    const params = new URLSearchParams();
    params.append("to", options.to);
    params.append("from", options.from);
    // answer_url is required for Plivo calls
    params.append("answer_url", options.url || this.provider.webhookBaseUrl || "https://s3.amazonaws.com/static.plivo.com/answer.xml");
    params.append("answer_method", options.method || "GET");

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader,
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to initiate Plivo call: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.request_uuid;
  }

  // SMS Management
  async sendSMS(options: MessageOptions): Promise<string> {
    switch (this.provider.name) {
      case "twilio":
        return this.sendTwilioSMS(options);
      case "telnyx":
        return this.sendTelnyxSMS(options);
      case "plivo":
        return this.sendPlivoSMS(options);
      default:
        throw new Error(`Unsupported provider: ${this.provider.name}`);
    }
  }

  private async sendTwilioSMS(options: MessageOptions): Promise<string> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.provider.accountSid}/Messages.json`;
    
    const params = new URLSearchParams();
    params.append("To", options.to);
    params.append("From", options.from);
    params.append("Body", options.body);
    if (options.mediaUrls) {
      options.mediaUrls.forEach((url) => params.append("MediaUrl", url));
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader,
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to send Twilio SMS: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sid;
  }

  private async sendTelnyxSMS(options: MessageOptions): Promise<string> {
    const url = "https://api.telnyx.com/v2/messages";

    // Ensure phone numbers are in E.164 format
    const formatE164 = (number: string) => {
      if (!number.startsWith("+")) {
        return `+${number.replace(/\D/g, "")}`;
      }
      return number;
    };

    const body = {
      from: formatE164(options.from),
      to: formatE164(options.to),
      text: options.body,
      messaging_profile_id: this.provider.connectionId, // Optional: can use messaging profile ID
      media_urls: options.mediaUrls,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to send Telnyx SMS: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data.id;
  }

  private async sendPlivoSMS(options: MessageOptions): Promise<string> {
    const url = `https://api.plivo.com/v1/Account/${this.provider.accountSid}/Message/`;

    const params = new URLSearchParams();
    params.append("src", options.from);
    params.append("dst", options.to);
    params.append("text", options.body);
    if (options.mediaUrls) {
      options.mediaUrls.forEach((url) => params.append("media_urls", url));
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.authHeader,
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to send Plivo SMS: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.message_uuid[0];
  }

  // Helper method to generate toll-free number
  private generateTollFreeNumber(): string {
    const prefixes = ["800", "888", "877", "866", "855", "844", "833"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
    return `${prefix}${number}`;
  }
}

// Factory function to create CPaaS integration
export function createCPaaSIntegration(provider: CPaaSProvider): CPaaSIntegration {
  return new CPaaSIntegration(provider);
}