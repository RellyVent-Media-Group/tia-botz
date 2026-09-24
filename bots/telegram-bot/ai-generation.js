/**
 * AI Generation Module for ChiefPilot Bots
 * Integration with AI image generation services
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// AI Service Configuration
const AI_SERVICES = {
  midjourney: {
    baseUrl: process.env.MIDJOURNEY_API_URL || 'https://api.midjourney.com',
    apiKey: process.env.MIDJOURNEY_API_KEY,
    maxConcurrency: 3
  },
  stableDiffusion: {
    baseUrl: process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:7860',
    apiKey: process.env.STABLE_DIFFUSION_API_KEY,
    maxConcurrency: 5
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    maxConcurrency: 10
  },
  ollama: {
    baseUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    apiKey: null, // Ollama doesn't require API key
    maxConcurrency: 3,
    model: process.env.OLLAMA_MODEL || 'stablediffusion'
  }
};

// Generation queue management
const generationQueue = new Map();
const activeGenerations = new Map();

// Enhanced prompt templates
const ENHANCED_PROMPT_TEMPLATES = {
  portrait: {
    cinematic: `A cinematic character portrait of {character}, {bio}, professional studio lighting, high detail, editorial photography style, 8k resolution, dramatic shadows, shallow depth of field`,
    anime: `Anime style portrait of {character}, {bio}, vibrant colors, clean lines, detailed features, digital art, high quality, manga style`,
    realistic: `Hyper-realistic portrait of {character}, {bio}, natural lighting, skin texture detail, photographic quality, 85mm lens, f/1.8`,
    fantasy: `Fantasy art portrait of {character}, {bio}, magical atmosphere, glowing elements, ethereal lighting, detailed armor/clothing, epic composition`
  },
  poster: {
    cinematic: `Promotional poster art featuring {character}, {title}, dramatic composition, cinematic lighting, strong silhouette, movie poster style, high contrast, professional design`,
    minimalist: `Minimalist poster design of {character}, clean lines, negative space, modern aesthetic, flat design, bold typography, limited color palette`,
    vintage: `Vintage poster style featuring {character}, {title}, retro color grading, grain texture, classic typography, nostalgic atmosphere, 1970s style`,
    cyberpunk: `Cyberpunk poster featuring {character}, {title}, neon lights, futuristic city background, glitch effects, high tech aesthetic, synthwave colors`
  },
  avatar: {
    modern: `Square avatar portrait of {character}, recognizable silhouette, clean background, polished digital illustration, {archetype} aesthetic, professional headshot style`,
    cartoon: `Cartoon avatar of {character}, expressive features, vibrant colors, clean lines, fun style, social media profile picture, digital art`,
    pixel: `Pixel art avatar of {character}, retro gaming style, limited color palette, 8-bit aesthetic, recognizable character design, sprite art`,
    vector: `Vector art avatar of {character}, clean lines, flat design, scalable graphics, modern minimal style, professional identity`
  },
  story: {
    narrative: `A narrative scene featuring {character}, {bio}, atmospheric lighting, emotional depth, cinematic storytelling, wide angle shot, environmental storytelling`,
    action: `Action scene featuring {character}, dynamic pose, motion blur, dramatic lighting, intense atmosphere, cinematic action shot, high energy`,
    emotional: `Emotional moment with {character}, expressive mood, soft lighting, intimate composition, storytelling focus, character-driven scene`,
    landscape: `Landscape scene featuring {character}, {bio}, epic environment, atmospheric perspective, detailed background, cinematic wide shot, fantasy setting`
  },
  // New prompt types
  concept: {
    character: `Character concept art of {character}, {bio}, multiple angles, turnaround view, detailed design breakdown, character sheet, professional concept art`,
    environment: `Environment concept art featuring {character}'s world, {bio}, detailed setting, atmospheric mood, architectural details, landscape design`,
    prop: `Prop design for {character}, detailed object design, functional aesthetic, material textures, orthographic views, concept art`
  },
  social: {
    instagram: `Instagram-ready image of {character}, {bio}, square format, aesthetic composition, trending style, social media optimized, engaging visual`,
    tiktok: `Vertical video thumbnail of {character}, {bio}, dynamic pose, attention-grabbing, trending aesthetic, social media format, high engagement`,
    youtube: `YouTube thumbnail featuring {character}, {title}, eye-catching composition, bold colors, professional design, high CTR style`
  },
  animation: {
    keyframe: `Animation keyframe of {character}, {bio}, dynamic pose, clear silhouette, animation-ready, expressive action, character animation`,
    reference: `Animation reference sheet for {character}, multiple poses, timing breakdown, motion studies, character animation guide`,
    turntable: `3D turntable render of {character}, rotating view, 360 degree presentation, detailed model, professional rendering, character showcase`
  }
};

// Generate enhanced prompt
function generateEnhancedPrompt(character, type, style = 'cinematic') {
  const templates = ENHANCED_PROMPT_TEMPLATES[type];
  if (!templates) {
    // Fallback to basic prompt
    return generateBasicPrompt(character, type);
  }
  
  const template = templates[style] || templates.cinematic || Object.values(templates)[0];
  let prompt = template;
  
  // Replace placeholders
  prompt = prompt.replace(/{character}/g, character.name);
  prompt = prompt.replace(/{title}/g, character.title || 'legendary character');
  prompt = prompt.replace(/{bio}/g, character.bio || 'mysterious figure');
  prompt = prompt.replace(/{archetype}/g, character.archetype || 'heroic');
  
  // Add character-specific details
  if (character.personaTraits && character.personaTraits.length > 0) {
    prompt += `, personality: ${character.personaTraits.join(', ')}`;
  }
  if (character.element) {
    prompt += `, elemental affinity: ${character.element}`;
  }
  
  return prompt;
}

// Basic prompt generation (fallback)
function generateBasicPrompt(character, type) {
  const basicPrompts = {
    portrait: `A cinematic character portrait of ${character.name}, ${character.bio || 'mysterious figure'}, professional studio lighting, high detail, editorial photography style.`,
    poster: `Promotional poster art featuring ${character.name}, ${character.title || 'legendary character'}, dramatic composition, cinematic lighting, strong silhouette.`,
    avatar: `Square avatar portrait of ${character.name}, recognizable silhouette, clean background, polished digital illustration, ${character.archetype || 'heroic'} aesthetic.`,
    story: `A narrative scene featuring ${character.name}, ${character.bio || 'on a journey through the Gilded Mirrors universe'}, atmospheric lighting, emotional depth, cinematic storytelling.`
  };
  
  return basicPrompts[type] || basicPrompts.portrait;
}

// Generate image using Midjourney API
async function generateWithMidjourney(prompt, options = {}) {
  const { baseUrl, apiKey } = AI_SERVICES.midjourney;
  
  if (!apiKey) {
    throw new Error('Midjourney API key not configured');
  }
  
  try {
    const response = await axios.post(`${baseUrl}/generate`, {
      prompt,
      ...options
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      service: 'midjourney',
      status: 'processing',
      generationId: response.data.id,
      imageUrl: response.data.imageUrl || null,
      estimatedTime: response.data.estimatedTime || 60
    };
  } catch (error) {
    throw new Error(`Midjourney generation failed: ${error.message}`);
  }
}

// Generate image using Stable Diffusion API
async function generateWithStableDiffusion(prompt, options = {}) {
  const { baseUrl, apiKey } = AI_SERVICES.stableDiffusion;
  
  try {
    const payload = {
      prompt,
      steps: options.steps || 20,
      cfg_scale: options.cfg_scale || 7,
      width: options.width || 512,
      height: options.height || 512,
      sampler_name: options.sampler || 'Euler a'
    };
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await axios.post(`${baseUrl}/sdapi/v1/txt2img`, payload, { headers });
    
    return {
      service: 'stable-diffusion',
      status: 'completed',
      generationId: response.data.id || Date.now().toString(),
      imageUrl: response.data.image ? `data:image/png;base64,${response.data.image}` : null,
      seed: response.data.seed
    };
  } catch (error) {
    throw new Error(`Stable Diffusion generation failed: ${error.message}`);
  }
}

// Generate image using OpenAI DALL-E
async function generateWithOpenAI(prompt, options = {}) {
  const { baseUrl, apiKey } = AI_SERVICES.openai;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await axios.post(`${baseUrl}/images/generations`, {
      prompt,
      n: options.n || 1,
      size: options.size || '1024x1024',
      model: options.model || 'dall-e-3'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      service: 'openai',
      status: 'completed',
      generationId: response.data.data[0].revisedPrompt || Date.now().toString(),
      imageUrl: response.data.data[0].url,
      revisedPrompt: response.data.data[0].revisedPrompt
    };
  } catch (error) {
    throw new Error(`OpenAI generation failed: ${error.message}`);
  }
}

// Generate text using Ollama (text-only fallback)
async function generateWithOllama(prompt, options = {}) {
  const { baseUrl, model } = AI_SERVICES.ollama;

  try {
    // Ollama's text generation API (for models like tinyllama, llama, etc.)
    const response = await axios.post(`${baseUrl}/api/generate`, {
      model: options.model || model,
      prompt,
      stream: false,
      options: {
        num_predict: options.num_predict || 512,
        temperature: options.temperature || 0.7
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Ollama returns generated text in response field
    return {
      service: 'ollama',
      status: 'completed',
      generationId: Date.now().toString(),
      text: response.data.response || null,
      model: model,
      isTextGeneration: true // Flag to indicate this is text, not image
    };
  } catch (error) {
    throw new Error(`Ollama generation failed: ${error.message}`);
  }
}

// Queue management for generation requests
function queueGeneration(userId, service, prompt, options = {}) {
  const queueId = `${userId}-${Date.now()}`;
  
  if (!generationQueue.has(userId)) {
    generationQueue.set(userId, []);
  }
  
  const queue = generationQueue.get(userId);
  const position = queue.length;
  
  queue.push({
    queueId,
    service,
    prompt,
    options,
    status: 'queued',
    queuedAt: new Date(),
    position
  });
  
  return { queueId, position, estimatedWait: position * 30 }; // 30 seconds per generation estimate
}

// Process queued generations with fallback support
async function processQueue(userId) {
  const queue = generationQueue.get(userId);
  if (!queue || queue.length === 0) return;

  const nextRequest = queue.find(req => req.status === 'queued');
  if (!nextRequest) return;

  nextRequest.status = 'processing';
  activeGenerations.set(nextRequest.queueId, nextRequest);

  // Define service priority with fallback chain (Ollama excluded for image generation)
  const imageServicePriority = ['midjourney', 'openai', 'stable-diffusion'];
  const textServicePriority = ['ollama', 'openai', 'midjourney'];

  // Determine if this is a text or image generation request
  const isTextRequest = nextRequest.options?.type === 'text' || nextRequest.options?.isTextGeneration;
  const servicePriority = isTextRequest ? textServicePriority : imageServicePriority;

  // If a specific service was requested, try it first, then fallback
  let servicesToTry = nextRequest.service === 'auto' ? servicePriority : [nextRequest.service, ...servicePriority.filter(s => s !== nextRequest.service)];

  let lastError = null;

  for (const service of servicesToTry) {
    try {
      let result;
      switch (service) {
        case 'midjourney':
          result = await generateWithMidjourney(nextRequest.prompt, nextRequest.options);
          break;
        case 'stable-diffusion':
          result = await generateWithStableDiffusion(nextRequest.prompt, nextRequest.options);
          break;
        case 'openai':
          result = await generateWithOpenAI(nextRequest.prompt, nextRequest.options);
          break;
        case 'ollama':
          result = await generateWithOllama(nextRequest.prompt, nextRequest.options);
          break;
        default:
          throw new Error(`Unknown service: ${service}`);
      }

      nextRequest.status = 'completed';
      nextRequest.result = result;
      nextRequest.completedAt = new Date();
      nextRequest.actualService = service; // Track which service actually succeeded

      // Remove from active generations
      activeGenerations.delete(nextRequest.queueId);

      return result;
    } catch (error) {
      lastError = error;
      console.log(`Service ${service} failed, trying next fallback: ${error.message}`);
      // Continue to next service in fallback chain
    }
  }

  // All services failed
  nextRequest.status = 'failed';
  nextRequest.error = lastError ? lastError.message : 'All generation services failed';
  nextRequest.failedAt = new Date();

  activeGenerations.delete(nextRequest.queueId);
  throw lastError || new Error('All generation services failed');
}

// Get generation status
function getGenerationStatus(queueId) {
  // Check active generations
  if (activeGenerations.has(queueId)) {
    return activeGenerations.get(queueId);
  }
  
  // Check all queues
  for (const [userId, queue] of generationQueue.entries()) {
    const found = queue.find(req => req.queueId === queueId);
    if (found) return found;
  }
  
  return null;
}

// Get user's generation queue
function getUserQueue(userId) {
  return generationQueue.get(userId) || [];
}

// Cancel generation
function cancelGeneration(queueId) {
  const request = getGenerationStatus(queueId);
  if (!request) return false;
  
  if (request.status === 'processing') {
    request.status = 'cancelled';
    activeGenerations.delete(queueId);
  } else if (request.status === 'queued') {
    request.status = 'cancelled';
  }
  
  return true;
}

// Get available services
function getAvailableServices() {
  const available = {};
  for (const [name, config] of Object.entries(AI_SERVICES)) {
    available[name] = {
      available: !!config.apiKey || name === 'stable-diffusion' || name === 'ollama', // SD and Ollama can work without API key locally
      maxConcurrency: config.maxConcurrency,
      baseUrl: config.baseUrl,
      model: config.model || null
    };
  }
  return available;
}

// Get available prompt types
function getAvailablePromptTypes() {
  return Object.keys(ENHANCED_PROMPT_TEMPLATES);
}

// Get available styles for a prompt type
function getAvailableStyles(promptType) {
  const templates = ENHANCED_PROMPT_TEMPLATES[promptType];
  return templates ? Object.keys(templates) : [];
}

// Export functions
export {
  generateEnhancedPrompt,
  generateBasicPrompt,
  generateWithMidjourney,
  generateWithStableDiffusion,
  generateWithOpenAI,
  generateWithOllama,
  queueGeneration,
  processQueue,
  getGenerationStatus,
  getUserQueue,
  cancelGeneration,
  getAvailableServices,
  getAvailablePromptTypes,
  getAvailableStyles,
  ENHANCED_PROMPT_TEMPLATES
};