import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CAST, LOCATIONS, EVENTS, GAZETTE_ISSUES } from "@/lib/gobblers-knob-data";
import React from "react";

export const Route = createFileRoute("/gobblers-knob")({ component: GobblersKnob });

function GobblersKnob() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const [sortKey, setSortKey] = React.useState<"name" | "type">("name");
  const [sortAsc, setSortAsc] = React.useState(true);

  const filteredCast = CAST.filter(c => {
    const matchesQuery = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesQuery && matchesType;
  }).sort((a, b) => {
    const comparison = a[sortKey] > b[sortKey] ? 1 : -1;
    return sortAsc ? comparison : -comparison;
  });

  const typeCounts = {
    Human: CAST.filter(c => c.type === "Human").length,
    Mythic: CAST.filter(c => c.type === "Mythic").length,
    Group: CAST.filter(c => c.type === "Group").length,
  };

  const tagCounts: Record<string, number> = {};
  CAST.forEach(c => {
    c.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Human": return "text-primary";
      case "Mythic": return "text-teal-400";
      case "Group": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-[#100e0a] text-[#f4efe2]">
      <style>{`
        :root {
          --ink: #f4efe2;
          --page: #100e0a;
          --panel: #19140f;
          --panel-2: #211a12;
          --rule: rgba(244,239,226,0.13);
          --brass: #c9a15a;
          --rust: #c1552e;
          --teal: #7cb0a6;
          --muted: #a49a86;
        }
      `}</style>

      <header className="border-b-2 border-[#c9a15a] bg-[#19140f]/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 no-underline text-[#f4efe2] hover:text-[#c9a15a]">
            <span className="text-sm font-semibold">← Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a49a86]">World data dashboard</span>
            <span className="rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-xs font-semibold text-[#c9a15a]">
              Gobbler's Knob
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1552e]">Reconciled against GOBBLERS_KNOB_BRAND_BIBLE_v2.md</p>
          <h1 className="font-display text-4xl font-bold md:text-6xl mt-3">World data dashboard</h1>
          <p className="mt-4 max-w-2xl text-lg text-[#a49a86]">
            Locations, cast, events, and themes from the Gobbler's Knob dataset, filtered and charted for browsing.
          </p>
          <div className="mt-4 border-l-3 border-[#c1552e] bg-[#c1552e]/7 p-4 rounded-r max-w-[74ch]">
            <p className="text-sm text-[#e2d9c8]">
              Three categories from the source file are not represented here: the storyline pairing a minor with an adult, the slur-based location and street names, and the age-ambiguous "mall" persona set. These are cut per the governing brand bible, not just hidden from view.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <div className="font-display text-3xl font-bold text-[#c9a15a]">{CAST.length}</div>
            <div className="text-xs text-[#a49a86] uppercase tracking-wider mt-1">Cast entries</div>
          </div>
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <div className="font-display text-3xl font-bold text-[#c9a15a]">{LOCATIONS.length}</div>
            <div className="text-xs text-[#a49a86] uppercase tracking-wider mt-1">Canon locations</div>
          </div>
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <div className="font-display text-3xl font-bold text-[#c9a15a]">{typeCounts.Human}</div>
            <div className="text-xs text-[#a49a86] uppercase tracking-wider mt-1">Human characters</div>
          </div>
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <div className="font-display text-3xl font-bold text-[#c9a15a]">{typeCounts.Mythic + typeCounts.Group}</div>
            <div className="text-xs text-[#a49a86] uppercase tracking-wider mt-1">Mythic / ensemble</div>
          </div>
        </div>

        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <h3 className="font-semibold mb-4">Cast by type</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#211a12] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#c9a15a]"
                    style={{ width: `${(typeCounts.Human / CAST.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#a49a86] w-20 text-right">Human</span>
                <span className="text-sm font-semibold w-8">{typeCounts.Human}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#211a12] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#7cb0a6]"
                    style={{ width: `${(typeCounts.Mythic / CAST.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#a49a86] w-20 text-right">Mythic</span>
                <span className="text-sm font-semibold w-8">{typeCounts.Mythic}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#211a12] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#c1552e]"
                    style={{ width: `${(typeCounts.Group / CAST.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-[#a49a86] w-20 text-right">Group</span>
                <span className="text-sm font-semibold w-8">{typeCounts.Group}</span>
              </div>
            </div>
          </div>

          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
            <h3 className="font-semibold mb-4">Most common tags</h3>
            <div className="space-y-2">
              {topTags.map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#211a12] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#7cb0a6]"
                      style={{ width: `${(count / Math.max(...Object.values(tagCounts))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#a49a86] w-32 truncate">{tag}</span>
                  <span className="text-sm font-semibold w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Cast</h2>
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search name, tag, or keyword…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#19140f] border border-[rgba(244,239,226,0.13)] text-[#f4efe2] px-3 py-2 rounded text-sm"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#19140f] border border-[rgba(244,239,226,0.13)] text-[#f4efe2] px-3 py-2 rounded text-sm"
            >
              <option value="">All types</option>
              <option value="Human">Human</option>
              <option value="Mythic">Mythic / creature</option>
              <option value="Group">Group / ensemble</option>
            </select>
          </div>
          <div className="text-sm text-[#a49a86] mb-4">
            {filteredCast.length} of {CAST.length} shown
          </div>
          <div className="border border-[rgba(244,239,226,0.13)] rounded-lg overflow-hidden bg-[#19140f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(244,239,226,0.13)]">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a49a86] cursor-pointer hover:text-[#c9a15a]"
                    onClick={() => {
                      if (sortKey === "name") setSortAsc(!sortAsc);
                      else { setSortKey("name"); setSortAsc(true); }
                    }}
                  >
                    Name {sortKey === "name" && (sortAsc ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a49a86] cursor-pointer hover:text-[#c9a15a]"
                    onClick={() => {
                      if (sortKey === "type") setSortAsc(!sortAsc);
                      else { setSortKey("type"); setSortAsc(true); }
                    }}
                  >
                    Type {sortKey === "type" && (sortAsc ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a49a86]">Summary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#a49a86]">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredCast.map((c) => (
                  <tr key={c.name} className="border-b border-[rgba(244,239,226,0.13)] last:border-0 hover:bg-[#211a12]">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className={`px-4 py-3 ${getTypeColor(c.type)}`}>{c.type}</td>
                    <td className="px-4 py-3 text-[#dcd4c3]">{c.summary}</td>
                    <td className="px-4 py-3">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-block text-xs px-2 py-0.5 rounded bg-[rgba(124,176,166,0.14)] text-[#7cb0a6] mr-1 mb-1"
                        >
                          {t}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Locations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOCATIONS.map((l) => (
              <div key={l.name} className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
                <div className="font-semibold text-lg">{l.name}</div>
                <div className="text-sm text-[#a49a86] mt-1">{l.meta}</div>
                <div className="text-sm text-[#dcd4c3] mt-2">{l.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Events & themes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENTS.map((e) => (
              <div key={e.name} className="border border-[rgba(244,239,226,0.13)] rounded-lg p-4 bg-[#19140f]">
                <div className="font-semibold text-lg">{e.name}</div>
                <div className="text-sm text-[#a49a86] mt-1">{e.meta}</div>
                <div className="text-sm text-[#dcd4c3] mt-2">{e.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Gazette Issues</h2>
          <div className="space-y-6">
            {GAZETTE_ISSUES.map((issue) => (
              <div key={issue.id} className="border border-[rgba(244,239,226,0.13)] rounded-lg p-6 bg-[#19140f]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1552e]">Issue #{issue.issueNumber}</div>
                    <h3 className="font-display text-xl font-bold mt-1">{issue.title}</h3>
                    <div className="text-sm text-[#a49a86] mt-1">
                      Published {issue.publishedAt} · Curated by {issue.curator}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#c9a15a] mb-2">Editorial</h4>
                    <p className="text-sm text-[#dcd4c3]">{issue.sections.editorial}</p>
                  </div>

                  {issue.sections.rhinoVerdicts && issue.sections.rhinoVerdicts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a15a] mb-2">Rhino Verdicts</h4>
                      <div className="space-y-2">
                        {issue.sections.rhinoVerdicts.map((verdict, idx) => (
                          <div key={idx} className="text-sm bg-[#211a12] p-3 rounded">
                            <div className="font-semibold text-[#f4efe2]">Episode {verdict.episode}: {verdict.title}</div>
                            <div className="text-[#7cb0a6] mt-1">{verdict.finalState}</div>
                            <div className="text-[#a49a86] mt-1 text-xs">{verdict.notes}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {issue.sections.quietComplaints && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a15a] mb-2">Quiet Complaints</h4>
                      <div className="text-sm bg-[#211a12] p-3 rounded">
                        <div className="text-[#dcd4c3]">Binder thickness: {issue.sections.quietComplaints.binderThicknessInches}"</div>
                        <div className="text-[#a49a86] mt-1 text-xs">Filed by: {issue.sections.quietComplaints.filedBy}</div>
                      </div>
                    </div>
                  )}

                  {issue.sections.continuityPoliceCitations && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a15a] mb-2">Continuity Police Citations</h4>
                      <div className="flex gap-4 text-sm">
                        <div className="bg-[#211a12] px-3 py-2 rounded">
                          <span className="text-[#c1552e] font-semibold">{issue.sections.continuityPoliceCitations.negative}</span>
                          <span className="text-[#a49a86] ml-1">negative</span>
                        </div>
                        <div className="bg-[#211a12] px-3 py-2 rounded">
                          <span className="text-[#7cb0a6] font-semibold">{issue.sections.continuityPoliceCitations.positive}</span>
                          <span className="text-[#a49a86] ml-1">positive</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {issue.sections.garyEnvelopeTraining && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#c9a15a] mb-2">Gary Envelope Training</h4>
                      <div className="text-sm bg-[#211a12] p-3 rounded">
                        <div className="text-[#dcd4c3]">{issue.sections.garyEnvelopeTraining.percentComplete}% complete</div>
                        <div className="text-[#a49a86] mt-1 text-xs">Target: {issue.sections.garyEnvelopeTraining.targetPercent}%</div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[rgba(244,239,226,0.13)] pt-4 mt-4">
                    <div className="text-sm italic text-[#a49a86] mb-2">
                      "{issue.sections.madameQuillMarginalia}"
                      <span className="ml-2">— Madame Quill</span>
                    </div>
                    <div className="text-sm text-[#dcd4c3]">
                      <span className="text-[#c9a15a]">Looking ahead:</span> {issue.sections.lookingAhead}
                    </div>
                    <div className="text-sm text-[#7cb0a6] mt-2 font-semibold">
                      {issue.sections.closingCertification}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-[rgba(244,239,226,0.13)] pt-4 text-sm text-[#a49a86]">
          Dashboard covers the retained/modified adult (18+) cast per the brand bible. Cast summaries are paraphrased for scannability — full profiles live in the source character files.
        </footer>
      </main>
    </div>
  );
}
