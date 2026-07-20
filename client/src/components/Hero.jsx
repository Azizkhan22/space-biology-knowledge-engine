import { Search, Sparkles, Network, FileText, Clock, X } from 'lucide-react';

const CHIPS = [
  'Microgravity & bone loss',
  'Radiation effects',
  'Plant growth in space',
  'Immune response',
  'Muscle atrophy',
  'Gene expression',
];

const Stat = ({ icon, value, label }) => (
  <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-space-400/40 hover:bg-white/[0.04]">
    <div className="mb-1.5 flex justify-center text-space-300">{icon}</div>
    <div className="text-xl font-semibold tabular-nums text-white">{value}</div>
    <div className="text-[11px] text-slate-400">{label}</div>
  </div>
);

const Hero = ({ searchQuery, setSearchQuery, onSearch, onChip, stats, recent, onRecent, onClearRecent }) => {
  const submit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:pt-24">
      {/* Drifting aurora glow behind the hero */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 flex justify-center" aria-hidden="true">
        <div
          className="hero-aurora h-[26rem] w-[42rem] max-w-[95vw] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 35% 40%, rgba(59,116,245,0.22), transparent 60%), radial-gradient(circle at 70% 55%, rgba(23,172,144,0.18), transparent 62%)',
          }}
        />
      </div>

      <div className="relative">
        <p className="reveal floaty mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300" style={{ animationDelay: '0.05s' }}>
          <Sparkles className="h-3.5 w-3.5 text-cosmic-300" />
          NASA Space Apps · Space Biology
        </p>

        <h1 className="reveal text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ animationDelay: '0.12s' }}>
          Explore NASA&apos;s space
          <br className="hidden sm:block" /> biology research
        </h1>

        <p className="reveal mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400" style={{ animationDelay: '0.2s' }}>
          Search 608 bioscience publications with semantic search, AI-generated summaries, and an
          interactive knowledge graph.
        </p>

        <form onSubmit={submit} className="reveal group mx-auto mt-8 flex max-w-xl items-center gap-2" style={{ animationDelay: '0.28s' }}>
          <div className="relative flex-1">
            {/* Glow ring that intensifies on focus */}
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-space-500/25 to-cosmic-500/25 opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-100" />
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-space-300" />
              <input
                data-search-input
                aria-label="Search publications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search, e.g. “microgravity and bone density”"
                className="search-glow relative w-full rounded-xl border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-4 text-[15px] text-white placeholder-slate-500"
              />
            </div>
          </div>
          <button type="submit" className="space-button h-[52px] shrink-0 px-6 text-sm">
            Search
          </button>
        </form>

        <div className="reveal mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-2" style={{ animationDelay: '0.36s' }}>
          <span className="text-xs text-slate-500">Try:</span>
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => onChip(c)}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-space-400/40 hover:bg-space-500/10 hover:text-white"
            >
              {c}
            </button>
          ))}
        </div>

        {recent?.length > 0 && (
          <div
            className="reveal mx-auto mt-3 flex max-w-xl flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" /> Recent
            </span>
            {recent.map((q) => (
              <button
                key={q}
                onClick={() => onRecent(q)}
                className="max-w-[220px] truncate rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-space-400/40 hover:bg-space-500/10 hover:text-white"
                title={q}
              >
                {q}
              </button>
            ))}
            <button
              onClick={onClearRecent}
              aria-label="Clear recent searches"
              className="rounded-full p-1 text-slate-500 transition-colors hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="reveal mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3" style={{ animationDelay: '0.44s' }}>
          <Stat icon={<FileText className="h-4 w-4" />} value="608" label="Publications" />
          <Stat icon={<Network className="h-4 w-4" />} value={stats?.topics ?? '—'} label="Topics & entities" />
          <Stat icon={<Sparkles className="h-4 w-4" />} value="AI" label="Summaries & Q&A" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
