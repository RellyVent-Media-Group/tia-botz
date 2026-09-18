import React, { useState } from "react";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Layers,
  Users,
  FileText,
  ChevronRight
} from "lucide-react";

const MAC_PROMPTS = [
  {
    id: 1,
    title: "Golden Hour Walk",
    category: "Solo",
    prompt: "Cinematic shot of Mac Nazarene walking down a gravel path during golden hour, long dreadlocks flowing with copper light, warm amber background, traditional yet modern aesthetic, contemplative expression, photorealistic rendering, no text or logos",
  },
  {
    id: 2,
    title: "Window Pause",
    category: "Solo",
    prompt: "Mac Nazarene pausing at a window, looking out with reflective expression, interior warm lighting contrasting with exterior twilight, copper skin tones highlighted, long dreadlocks visible, traditional wisdom aesthetic, cinematic composition",
  },
  {
    id: 3,
    title: "Café Conversation",
    category: "Solo",
    prompt: "Mac Nazarene in a cozy café conversation, warm measured energy, community-focused presence, golden hour light filtering through window, approachable and wise expression, Afro-American/Ameri-Indian heritage visible, photorealistic style",
  },
  {
    id: 4,
    title: "Night Walk",
    category: "Solo",
    prompt: "Mac Nazarene walking at night, street lamps casting warm glow, contemplative mood, copper skin tones, long dreadlocks, traditional yet modern aesthetic, cinematic night photography, no text or logos",
  },
  {
    id: 5,
    title: "Gravel Path Looking Back",
    category: "Solo",
    prompt: "Mac Nazarene looking back on a gravel path, reflective moment, golden hour lighting, warm amber tones, trust-building presence, community-focused energy, photorealistic rendering, cinematic composition",
  },
  {
    id: 6,
    title: "Chair Reading",
    category: "Solo",
    prompt: "Mac Nazarene reading in a comfortable chair, traditional wisdom with warm measured energy, copper skin, long dreadlocks, intimate indoor lighting, contemplative expression, photorealistic style, no text or logos",
  },
  {
    id: 7,
    title: "Community Gathering",
    category: "Solo",
    prompt: "Mac Nazarene at a community gathering, gentle smile, trusted presence, golden hour light, people in background, approachable and wise, Afro-American/Ameri-Indian heritage, warm amber tones, cinematic portrait",
  },
  {
    id: 8,
    title: "Bridge Between Worlds",
    category: "Solo",
    prompt: "Monumental hero shot of Mac Nazarene standing as bridge between traditional community and digital future, symbolic light connection, copper skin, long dreadlocks, traditional yet modern aesthetic, dramatic lighting, photorealistic rendering",
  },
];

const MARY_PROMPTS = [
  {
    id: 9,
    title: "Tech Studio Portrait",
    category: "Solo",
    prompt: "Cinematic epic portrait of Mary Magnumbytes, sharp dark bob hair glowing with circuit light, teal-gold background, smart glasses reflect data streams, tech-forward hybrid style, smooth alabaster skin, expressive hand movements",
  },
  {
    id: 10,
    title: "Tablet Workspace",
    category: "Solo",
    prompt: "Mary Magnumbytes with hand on rugged tablet, cozy tech studio, golden hour light filtering through window, hazel eyes visible, shoulder-length layered light-brown hair with copper highlights, dynamic leaning-forward energy",
  },
  {
    id: 11,
    title: "Digital Universe Center",
    category: "Solo",
    prompt: "Monumental branding hero shot of Mary Magnumbytes as center of a digital universe, tablet projecting holographic worlds, dramatic golden backlight, hazel eyes, dark bob hair, curvy voluptuous figure, tech-forward style",
  },
  {
    id: 12,
    title: "Content Creation Focus",
    category: "Solo",
    prompt: "Mary Magnumbytes focused on content creation, AI-powered narrative strategist, tech-forward hybrid style, smart glasses, hazel eyes big and expressive, light-brown hair with copper highlights, modern office setting",
  },
  {
    id: 13,
    title: "Visual Arts Planning",
    category: "Solo",
    prompt: "Mary Magnumbytes planning visual arts content, expressive hand movements, dynamic energy, tech studio environment, teal-gold color scheme, smart glasses, dark bob hair, photorealistic rendering",
  },
  {
    id: 14,
    title: "Data Stream Analysis",
    category: "Solo",
    prompt: "Mary Magnumbytes analyzing data streams, smart glasses reflecting information, focused expression, tech-forward aesthetic, hazel eyes, light-brown hair with copper highlights, cinematic lighting, no text or logos",
  },
  {
    id: 15,
    title: "Warm Trust Portrait",
    category: "Solo",
    prompt: "Warm trust portrait of Mary Magnumbytes, soft smile, hand on rugged tablet, golden hour light filtering through window, cozy tech studio, approachable presence, hazel eyes, dark bob hair, photorealistic style",
  },
  {
    id: 16,
    title: "Strategic Narrative",
    category: "Solo",
    prompt: "Mary Magnumbytes as narrative strategist, dynamic energy, expressive hand movements, tech-forward hybrid style, teal-gold background, smart glasses, curvy voluptuous figure, cinematic composition",
  },
  {
    id: 17,
    title: "Creative Process",
    category: "Solo",
    prompt: "Mary Magnumbytes in creative process, tech studio environment, hazel eyes expressive, light-brown hair with copper highlights, smooth alabaster skin, dynamic leaning-forward energy, photorealistic rendering",
  },
];

const DUO_PROMPTS = [
  {
    id: 18,
    title: "Golden Hour Collaboration",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes collaborating during golden hour, Mac with copper tones and dreadlocks, Mary with hazel eyes and dark bob, warm amber lighting, traditional meets tech aesthetic, cinematic composition, photorealistic rendering",
  },
  {
    id: 19,
    title: "Strategic Planning Session",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes in strategic planning, Mac with measured wisdom, Mary with dynamic energy, tech studio environment, golden hour light, complementary styles, no text or logos",
  },
  {
    id: 20,
    title: "Community and Digital Bridge",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes as bridge between traditional community and digital future, Mac with traditional wisdom, Mary with tech-forward innovation, symbolic light connection, dramatic lighting",
  },
  {
    id: 21,
    title: "Reflective Dialogue",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes in reflective dialogue, warm indoor lighting, Mac with contemplative expression, Mary with focused energy, copper and teal-gold color scheme, cinematic portrait style",
  },
  {
    id: 22,
    title: "Night Strategy Discussion",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes in night strategy discussion, street lamp lighting, Mac with trust-building presence, Mary with analytical focus, complementary visual styles, photorealistic rendering",
  },
  {
    id: 23,
    title: "Creative Partnership",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes as creative partners, traditional wisdom meets digital innovation, warm amber tones, expressive interactions, cinematic composition, no text or logos",
  },
  {
    id: 24,
    title: "Temenos Integration",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes in Temenos integration ceremony, conscious dialogue between persona and shadow, golden solar backlight, atmospheric hazing, ceremonial dignity, cinematic style",
  },
  {
    id: 25,
    title: "Future Vision",
    category: "Duo",
    prompt: "Mac Nazarene and Mary Magnumbytes envisioning the future, Mac bridging community and digital, Mary projecting holographic worlds, dramatic lighting, symbolic elements, photorealistic rendering",
  },
];

const BRAND_COLORS = {
  mac: {
    primary: "#f27d26",
    secondary: "#ffaa5e",
    accent: "#c44d00",
    warm: "#e65c00",
  },
  mary: {
    primary: "#0ea5e9",
    secondary: "#38bdf8",
    accent: "#0284c7",
    cool: "#0c4a6e",
  },
  duo: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    accent: "#7c3aed",
    blend: "#6366f1",
  },
};

export const PromptVaultView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "mac" | "mary" | "duo">("all");
  const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);

  const allPrompts = [...MAC_PROMPTS, ...MARY_PROMPTS, ...DUO_PROMPTS];
  
  const filteredPrompts = selectedCategory === "all" 
    ? allPrompts 
    : selectedCategory === "mac" 
      ? MAC_PROMPTS 
      : selectedCategory === "mary" 
        ? MARY_PROMPTS 
        : DUO_PROMPTS;

  const handleCopyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleDownloadAll = () => {
    const allPromptsText = allPrompts.map(p => 
      `#${p.id}: ${p.title}\nCategory: ${p.category}\n\n${p.prompt}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([allPromptsText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mac-mary-prompt-vault.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Mac & Mary Prompt Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            25 Cinematic AI Prompts for Consistent Character Generation
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Professional prompt system for Mac Nazarene and Mary Magnumbytes characters. 
            Character consistency locks for Midjourney, Kling 2.0, Runway, Pika, and Stable Diffusion.
            90-minute batch workflow included.
          </p>
        </div>
      </div>

      {/* Category Filter & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#140b07]/90 p-4 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All 25", icon: Layers },
            { id: "mac", label: "Mac Solo", icon: Users },
            { id: "mary", label: "Mary Solo", icon: BookOpen },
            { id: "duo", label: "Duo Scenes", icon: FileText },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-[0_0_15px_rgba(242,125,38,0.3)] border border-[#ffaa5e]"
                    : "text-[#b8aba0] hover:text-white hover:bg-[#1f110a] border border-transparent hover:border-[#f27d26]/30"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#0a0502]" : "text-[#f27d26]"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c0603] border border-[#f27d26]/30 text-[#ffaa5e] text-xs font-mono hover:bg-[#1a0f0a] hover:border-[#f27d26] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download All</span>
        </button>
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((prompt) => {
          const colorScheme = prompt.category === "Solo" && prompt.id <= 8 
            ? BRAND_COLORS.mac 
            : prompt.category === "Solo" && prompt.id > 8 
              ? BRAND_COLORS.mary 
              : BRAND_COLORS.duo;
          
          return (
            <div
              key={prompt.id}
              className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-xl p-5 space-y-3 hover:border-[#f27d26]/50 hover:shadow-[0_0_20px_rgba(242,125,38,0.12)] transition-all backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[#ffaa5e] bg-[#24130b] px-2 py-0.5 rounded">
                      #{prompt.id}
                    </span>
                    <span className="text-[10px] font-mono text-[#96897e] uppercase">
                      {prompt.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#fcf8f5] font-cinzel">{prompt.title}</h3>
                </div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colorScheme.primary }}
                />
              </div>

              <p className="text-xs text-[#d5c8be] leading-relaxed line-clamp-4">
                {prompt.prompt}
              </p>

              <button
                onClick={() => handleCopyPrompt(prompt.prompt, prompt.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0c0603] border border-[#f27d26]/20 text-[#ffaa5e] text-xs font-mono hover:bg-[#1a0f0a] hover:border-[#f27d26] transition-all cursor-pointer"
              >
                {copiedPromptId === prompt.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Brand Color Reference */}
      <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
        <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
          <Sparkles className="w-4 h-4 text-[#f27d26]" />
          Brand Color Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#ffaa5e] uppercase">Mac Nazarene</div>
            <div className="flex gap-2">
              {Object.entries(BRAND_COLORS.mac).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-1">
                  <div 
                    className="w-6 h-6 rounded border border-[#f27d26]/30"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] font-mono text-[#96897e]">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-[#ffaa5e] uppercase">Mary Magnumbytes</div>
            <div className="flex gap-2">
              {Object.entries(BRAND_COLORS.mary).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-1">
                  <div 
                    className="w-6 h-6 rounded border border-[#f27d26]/30"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] font-mono text-[#96897e]">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-[#ffaa5e] uppercase">Duo Scenes</div>
            <div className="flex gap-2">
              {Object.entries(BRAND_COLORS.duo).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-1">
                  <div 
                    className="w-6 h-6 rounded border border-[#f27d26]/30"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] font-mono text-[#96897e]">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 90-Minute Workflow Reference */}
      <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
        <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
          <Layers className="w-4 h-4 text-[#f27d26]" />
          90-Minute Batch Workflow
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { time: "0-20 min", step: "Generate Images", desc: "Create 5 character images using prompts" },
            { time: "20-50 min", step: "Animate with Kling", desc: "Animate all 5 with 2 versions each" },
            { time: "50-70 min", step: "Export & Trim", desc: "Export, trim, add watermark" },
            { time: "70-90 min", step: "Write Captions", desc: "Write captions using included formula" },
          ].map((item, i) => (
            <div key={i} className="bg-[#0c0603] p-3 rounded-lg border border-[#f27d26]/15 space-y-2">
              <div className="text-[10px] font-mono text-[#ffaa5e] font-bold">{item.time}</div>
              <div className="text-xs font-bold text-[#fcf8f5]">{item.step}</div>
              <div className="text-[10px] text-[#96897e]">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notion Integration Notice */}
      <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
        <h3 className="text-sm font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
          <FileText className="w-4 h-4 text-[#f27d26]" />
          Notion Templates Included
        </h3>
        
        <p className="text-xs text-[#d5c8be] leading-relaxed">
          The complete package includes Notion database exports for Character Database, Content Calendar, and Task List. 
          Import the CSV files from the <code className="text-[#ffaa5e]">notion-exports/</code> folder to set up your character management and production workflow.
        </p>

        <div className="flex flex-wrap gap-2">
          {["Character Database", "Content Calendar", "Task List"].map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#0c0603] border border-[#f27d26]/20 text-[#ffaa5e] font-medium shadow-sm flex items-center gap-1.5"
            >
              <ChevronRight className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
