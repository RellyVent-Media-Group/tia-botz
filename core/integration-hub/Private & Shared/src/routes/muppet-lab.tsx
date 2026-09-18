import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/muppet-lab")({ component: MuppetLab });

function MuppetLab() {
  return (
    <div className="min-h-screen bg-[#08111d] text-[#e9f0ef]">
      <style>{`
        :root {
          --ink: #08111d;
          --panel: #0e1b2b;
          --line: rgba(126, 210, 224, 0.22);
          --cyan: #8ae8f5;
          --amber: #f0ad66;
          --paper: #e9f0ef;
          --muted: #9eb2bd;
        }
        .icon-fill {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 30% 20%, rgba(138,232,245,0.16), transparent 55%), linear-gradient(160deg, #10202f, #081019);
        }
        .hero-photo { position: relative; }
        .hero-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(8,17,29,0.96) 5%, rgba(8,17,29,0.74) 48%, rgba(8,17,29,0.28) 100%);
        }
        .signal-line { height: 1px; background: linear-gradient(90deg, transparent, var(--cyan), transparent); opacity: 0.75; }
        .dossier-card {
          background: linear-gradient(145deg, rgba(20,39,56,0.92), rgba(10,23,37,0.9));
          border: 1px solid var(--line);
          box-shadow: 0 16px 50px rgba(0,0,0,0.24);
        }
        .dossier-image { min-height: 245px; position: relative; overflow: hidden; }
        .dossier-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8,17,29,0.92), transparent 62%);
          pointer-events: none;
        }
        .tab-button { border: 1px solid rgba(158,178,189,0.25); color: #b9cad0; transition: 180ms ease; }
        .tab-button:hover, .tab-button[aria-selected="true"] {
          color: #07131d; border-color: var(--cyan); background: var(--cyan);
          box-shadow: 0 0 22px rgba(138,232,245,0.22);
        }
        .prompt-panel { display: none; }
        .prompt-panel.is-active { display: grid; }
        .prompt-card { border: 1px solid rgba(158,178,189,0.19); background: rgba(8,17,29,0.56); transition: transform 180ms ease, border-color 180ms ease; }
        .prompt-card:hover { transform: translateY(-3px); border-color: rgba(138,232,245,0.62); }
        .copy-button { border: 1px solid rgba(138,232,245,0.34); color: var(--cyan); transition: 180ms ease; }
        .copy-button:hover { background: rgba(138,232,245,0.12); border-color: var(--cyan); }
        @media (max-width: 700px) {
          .hero-photo::after { background: linear-gradient(to top, rgba(8,17,29,0.98) 6%, rgba(8,17,29,0.55) 100%); }
        }
      `}</style>

      <header className="w-full border-b border-cyan-100/10 bg-[#08111d]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 no-underline text-[#e9f0ef] hover:text-[#8ae8f5]">
            <span className="text-sm font-semibold">← Back to Home</span>
          </Link>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber-200">Pipeline v1</span>
        </div>
      </header>

      <main>
        <section className="relative min-h-[560px] overflow-hidden border-b border-cyan-100/10">
          <div className="hero-photo absolute inset-0">
            <div className="icon-fill">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#8ae8f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
          </div>
          <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-end px-5 py-16 md:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Open-source animation pipeline</p>
              <div className="signal-line mt-5 w-44"></div>
              <h1 className="font-display mt-6 max-w-3xl text-5xl font-bold leading-[0.98] text-[#e9f0ef] md:text-7xl">Bring felt-and-foam characters to life with code</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">Rhubarb Lip Sync extracts phoneme timing from any audio track. We map those phonemes to mouth shapes, composite them onto a character sprite, and let FFmpeg render the result — no motion capture, no paid API keys.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#prompts" className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-5 py-3 font-bold text-[#07131d] no-underline transition hover:-translate-y-0.5">
                  <span>Explore the prompt library</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7l10 10M17 7l-10 10"/>
                  </svg>
                </a>
                <span className="text-sm text-slate-300">Built on Rhubarb, Pillow, and FFmpeg</span>
              </div>
            </div>
          </div>
        </section>

        <section id="dossiers" className="mx-auto w-full max-w-7xl px-5 py-20 md:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Character dossiers</p>
              <h2 className="font-display mt-3 text-4xl font-bold text-[#e9f0ef] md:text-5xl">Meet the test cast</h2>
            </div>
            <p className="max-w-lg leading-7 text-slate-300">Two original characters used to stress-test the pipeline — one for vowel-heavy narration, one for rapid-fire phoneme switching.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="dossier-card overflow-hidden rounded-2xl">
              <div className="dossier-image">
                <div className="icon-fill">
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#8ae8f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <span className="absolute left-5 top-5 z-10 rounded-full border border-cyan-100/30 bg-[#08111d]/80 px-3 py-1 text-xs font-bold tracking-[0.16em] text-cyan-100">CH-01</span>
              </div>
              <div className="p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Test character — neutral expression</p>
                <h3 className="font-display mt-3 text-3xl font-bold text-[#e9f0ef]">Nadia the Narrator</h3>
                <p className="mt-4 leading-7 text-slate-200">A calm-voiced host character used to validate wide-mouth phoneme frames (A, E, O) and to confirm the resting-mouth pose reads correctly between lines.</p>
                <blockquote className="mt-6 border-l-2 border-cyan-200 pl-4 text-sm font-medium leading-6 text-slate-200">"Every syllable gets its own shape — that's the whole trick."</blockquote>
              </div>
            </article>
            <article className="dossier-card overflow-hidden rounded-2xl">
              <div className="dossier-image">
                <div className="icon-fill">
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#f0ad66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <span className="absolute left-5 top-5 z-10 rounded-full border border-amber-200/30 bg-[#08111d]/80 px-3 py-1 text-xs font-bold tracking-[0.16em] text-amber-200">CH-02</span>
              </div>
              <div className="p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Test character — expressive range</p>
                <h3 className="font-display mt-3 text-3xl font-bold text-[#e9f0ef]">Chip Wobblejaw</h3>
                <p className="mt-4 leading-7 text-slate-200">A bouncy, high-energy character used to stress-test the body-bob animation and fast M/B/P-to-open-vowel transitions without frame flicker.</p>
                <blockquote className="mt-6 border-l-2 border-amber-200 pl-4 text-sm font-medium leading-6 text-slate-200">"If my jaw's not moving, the beat's not landing."</blockquote>
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 pb-20 md:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-100/20 bg-[#0e1b2b] px-6 py-10 md:px-12 md:py-12">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-200/10 blur-3xl"></div>
            <div className="relative grid gap-8 md:grid-cols-[0.85fr_1.45fr] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">How it works</p>
                <h2 className="font-display mt-3 text-4xl font-bold text-[#e9f0ef]">Audio in, puppet out</h2>
              </div>
              <p className="text-lg leading-8 text-slate-100">Rhubarb Lip Sync analyzes an audio file and returns phoneme timings, which fall back to a mock timing pass if Rhubarb isn't installed. Each phoneme maps to a mouth shape drawn onto the character sprite with Pillow, an optional sine-wave body bob adds a sense of a live performance on the beat, and FFmpeg stitches the resulting frames back together with the original audio into a finished MP4 — the whole pass runs locally, with no paid API keys required.</p>
            </div>
          </div>
        </section>

        <section id="prompts" className="w-full border-y border-cyan-100/10 bg-[#0a1725]/70">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
            <div className="mb-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Prompt library</p>
              <h2 className="font-display mt-3 text-4xl font-bold text-[#e9f0ef] md:text-5xl">Prompts for building the cast</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">Reusable prompts for scripting dialogue, debugging the pipeline, drafting character bios, and briefing sprite art — written for pasting straight into an AI assistant.</p>
            </div>

            <MuppetLabPrompts />
          </div>
        </section>
      </main>
    </div>
  );
}

function MuppetLabPrompts() {
  const [activeTab, setActiveTab] = React.useState("dialogue");

  const tabs = [
    { id: "dialogue", label: "Dialogue" },
    { id: "investigation", label: "Debugging" },
    { id: "story", label: "Story" },
    { id: "visual", label: "Visual" },
  ];

  const prompts = {
    dialogue: [
      {
        category: "Scripting",
        title: "Character voice pass",
        text: "Write three lines of dialogue for [CHARACTER NAME], a felt puppet with a [energetic/calm] personality. Keep each line under 12 words so mouth-flap timing stays readable, and include one line with a strong vowel sound (A/E/O) to test the wide-mouth phoneme frames.",
      },
      {
        category: "Pacing",
        title: "Beat-matched line",
        text: "Rewrite this line of dialogue so it lands on a 4/4 beat at 120 BPM, alternating open and closed mouth sounds every half-beat: [PASTE LINE HERE]",
      },
    ],
    investigation: [
      {
        category: "Troubleshooting",
        title: "Phoneme mismatch check",
        text: "Here is a phoneme timing list extracted by Rhubarb Lip Sync: [PASTE JSON]. Flag any timestamps where the gap between phonemes is under 50ms, since these are the most likely to cause flickering in the rendered mouth shapes.",
      },
      {
        category: "Pipeline review",
        title: "Render failure triage",
        text: "FFmpeg failed with this error while stitching frames into video: [PASTE ERROR]. My frame naming pattern is frame_%06d.png at 24fps. Suggest the most likely cause and a one-line fix.",
      },
    ],
    story: [
      {
        category: "Backstory",
        title: "Character origin pass",
        text: "Write a 3-sentence backstory for a felt puppet character named [NAME] who works as a [ROLE] in a puppet variety show. Give them one verbal tic and one recurring prop that could double as a visual gag.",
      },
      {
        category: "Worldbuilding",
        title: "Show format sketch",
        text: "Sketch a 5-segment outline for a 10-minute puppet variety show episode featuring [CHARACTER LIST], alternating fast-paced and slow segments to showcase the pipeline's range.",
      },
    ],
    visual: [
      {
        category: "Sprite design",
        title: "Mouth shape reference",
        text: "Describe 8 distinct mouth shapes for a felt-puppet character's phoneme set (open-wide, closed, round, teeth-visible, resting, etc.), each in one sentence a sprite artist could use as a drawing brief.",
      },
      {
        category: "Expression set",
        title: "Expression sheet prompt",
        text: "Generate a list of 6 facial expressions for [CHARACTER NAME] that match their personality archetype, with brief notes on eyebrow position, eye focus, and mouth tension for each.",
      },
    ],
  };

  return (
    <>
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Prompt categories">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="tab-button rounded-full px-4 py-2 text-sm font-bold"
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${tab.id}-panel`}
            className={`prompt-panel grid gap-5 md:grid-cols-2 ${activeTab === tab.id ? "is-active" : ""}`}
            role="tabpanel"
          >
            {prompts[tab.id as keyof typeof prompts].map((prompt, idx) => (
              <article key={idx} className="prompt-card rounded-xl p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">{prompt.category}</p>
                <h3 className="font-display mt-2 text-2xl font-bold text-[#e9f0ef]">{prompt.title}</h3>
                <p className="mt-4 whitespace-pre-line leading-7 text-slate-200">{prompt.text}</p>
                <button
                  className="copy-button mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold"
                  type="button"
                  onClick={() => navigator.clipboard.writeText(prompt.text)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  Copy
                </button>
              </article>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
