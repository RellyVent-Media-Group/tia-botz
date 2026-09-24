import express from "express";
import path from "path";
import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Content Security Policy middleware
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "frame-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'"
  );
  next();
});

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

// Active Imagination Audio Prompt endpoint (Jungian guided meditation scripts)
app.post("/api/generate-audio-prompt", async (req, res) => {
  try {
    const {
      soulName = "The Soul Archetype",
      coreWound = "Unconscious terror of dissolution",
      archetypeWound = "Primordial Exile",
      goldenShadow = "Sovereign peace and unbounded vitality",
      intensity = "deep",
      polarity = "Control ↔ Surrender"
    } = req.body;

    const ai = getGenAI();
    const prompt = `You are an expert Jungian depth psychologist and contemplative meditation guide specializing in Carl Jung's technique of Active Imagination.
Craft an authentic, hypnotic, somatically grounded "Active Imagination" guided audio prompt script and text-to-speech narrative for a seeker integrating the following soul archetype:

Archetype Soul Name: "${soulName}"
Core Wound: "${coreWound}"
Archetypal Wound Category: "${archetypeWound}"
Polarity Axis: "${polarity}"
Golden Shadow (Disowned Virtue): "${goldenShadow}"
Shadow Intensity Level: "${intensity}"

Design requirements:
1. Provide an evocative, poetic title for this guided meditation.
2. Provide a specific acoustic soundscape recommendation (e.g. Solfeggio frequencies, binaural cues, natural ambient elements, sub-bass levels).
3. Provide concise vocal pacing guidance for the narrator or text-to-speech engine.
4. Write the full spoken audio script formatted with explicit timing cues like "[Pause 4s]", breathing instructions, visceral somatic descent, meeting the autonomous shadow personification, the Socratic unconscious dialogue questions, and the physical reclamation of the golden shadow.

Output strictly valid JSON with this exact schema:
{
  "title": "string",
  "soundscape": "string",
  "pacingGuidance": "string",
  "script": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        title: `Active Imagination Descent: ${soulName}`,
        soundscape: '432Hz Solfeggio meditative drone with gentle sub-bass hum',
        pacingGuidance: 'Speak slowly and deliberately with 4-5 second pauses.',
        script: responseText
      };
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/generate-audio-prompt:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate audio script',
      title: `Active Imagination Descent: ${req.body?.soulName || 'Soul'}`,
      soundscape: '432Hz Solfeggio drone with low-frequency sub-hum',
      pacingGuidance: 'Speak slowly and deliberately.',
      script: `Close your eyes and breathe into your core. Acknowledge the wound of "${req.body?.coreWound || 'the unintegrated self'}". Allow the autonomous shadow to speak in stillness. Reclaim the golden shadow of "${req.body?.goldenShadow || 'vital wholeness'}".`
    });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function configureApp() {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
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

// Start server for local development
appPromise.then((configuredApp) => {
  configuredApp.listen(PORT, "0.0.0.0", () => {
    console.log(`ChiefPilot Universe Server running on http://0.0.0.0:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Export for ES modules
export default appPromise;
