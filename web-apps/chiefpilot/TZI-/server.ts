import express from "express";
import path from "path";
import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// High-Thinking Reasoning endpoint (gemini-3.1-pro-preview with thinkingLevel: HIGH)
app.post("/api/gemini/think", async (req, res) => {
  try {
    const { prompt, context, domain } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    const systemInstruction = `You are the Chief Creative Architect and Lore Master of the Gilded Mirrors Universe and ChiefPilot Production Operating System. 
Analyze complex lore inquiries, shadow integration paradoxes, stop-motion puppet mechanics, or narrative arcs with rigorous structural thinking and alchemical precision.
Context: ${context || "Gilded Mirrors / ChiefPilot v3 Universe"}
Domain: ${domain || "Universal Analysis"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({
      text: response.text || "No response generated.",
      model: "gemini-3.1-pro-preview",
      thinkingLevel: "HIGH",
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/think:", error);
    res.status(500).json({ error: error.message || "Failed to generate high-thinking analysis" });
  }
});

// Standard Text Generation for Scripts, Lore, Social Drops
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, type } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    const defaultInstruction = "You are an expert scriptwriter, puppet master, and lore architect for Gilded Mirrors, Harlan & Rojas Fake News Desk, and the 30 Souls operating system.";

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
      },
    });

    res.json({
      text: response.text || "",
      type: type || "general",
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

// Text-to-Speech endpoint (gemini-3.1-flash-tts-preview)
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voice = "Kore", speaker = "single", multiSpeakers } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS" });
    }

    const ai = getGenAI();

    let response;
    if (speaker === "multi" && Array.isArray(multiSpeakers) && multiSpeakers.length === 2) {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: multiSpeakers[0].name || "Harlan",
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: multiSpeakers[0].voice || "Fenrir" },
                  },
                },
                {
                  speaker: multiSpeakers[1].name || "Rojas",
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: multiSpeakers[1].voice || "Zephyr" },
                  },
                },
              ],
            },
          },
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });
    }

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio stream returned from TTS model" });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: "audio/pcm;rate=24000",
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/tts:", error);
    res.status(500).json({ error: error.message || "TTS generation failed" });
  }
});

// Image Generation endpoint (gemini-3.1-flash-lite-image)
app.post("/api/gemini/image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: `Cinematic puppet concept art, stop motion studio lighting, Gilded Mirrors aesthetics: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image generated by model" });
    }

    res.json({ imageUrl, prompt });
  } catch (error: any) {
    console.error("Error in /api/gemini/image:", error);
    res.status(500).json({ error: error.message || "Image generation failed" });
  }
});

// Shadow Engine Dialogue endpoint
app.post("/api/gemini/shadow-dialogue", async (req, res) => {
  try {
    const { soulName, archetype, personaTraits, shadowTraits, topic, conversationHistory } = req.body;

    const ai = getGenAI();
    const systemInstruction = `You are running a conscious Temenos container for the Gilded Mirrors Shadow Engine.
You orchestrate an authentic, psychological, and alchemical dialogue between a Soul's Persona and their unconscious Shadow.
Soul: ${soulName}
Archetype: ${archetype}
Persona: ${personaTraits?.join(", ") || "Conscious Ego"}
Shadow: ${shadowTraits?.join(", ") || "Unconscious Repression / Gold in the Dark"}
Rules:
- Neither persona nor shadow may destroy the other.
- The Temenos acts as the sacred protected vessel for integration.
- Structure dialogue with turns labeled [PERSONA] and [SHADOW], concluding with an [ALCHEMICAL SYNTHESIS & PRACTICE].`;

    const prompt = `Topic of dialogue: ${topic || "The Source of Hidden Tension and Autonomy"}
Previous dialogue context: ${JSON.stringify(conversationHistory || [])}
Generate the next 3-4 dynamic dialogue beats between Persona and Shadow followed by an actionable integration ritual.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      dialogue: response.text || "",
      soulName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/shadow-dialogue:", error);
    res.status(500).json({ error: error.message || "Failed to generate shadow dialogue" });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  return app;
}

// Configure the app and export
const appPromise = configureApp();

// Export for ES modules
export default appPromise;

// Export for CommonJS (Vercel)
// @ts-ignore - module.exports is available in CJS context
if (typeof module !== 'undefined' && module.exports) {
  appPromise.then((app) => {
    module.exports = app;
  });
}

// Start server for local development
appPromise.then((configuredApp) => {
  if (process.argv[1]?.includes('server.ts') || process.env.NODE_ENV !== 'production') {
    configuredApp.listen(PORT, "0.0.0.0", () => {
      console.log(`ChiefPilot Universe Server running on http://0.0.0.0:${PORT}`);
    });
  }
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
