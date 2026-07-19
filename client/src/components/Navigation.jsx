import { Search, Rocket, Github, LayoutGrid, Network } from 'lucide-react';

const Navigation = ({ view, searchQuery, setSearchQuery, onSearch, onHome, onExplore }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const showSearch = view !== 'home';

  return (
    <nav className="z-40 border-b border-white/8 bg-base-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Brand */}
          <button onClick={onHome} className="flex shrink-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-space-500 to-cosmic-500 shadow-lg shadow-space-900/40">
              <Rocket className="h-5 w-5 text-white" />
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[15px] font-semibold text-white">NASA Space Biology</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Knowledge Engine
              </span>
            </span>
          </button>

          {/* Search (hidden on home — the hero owns it) */}
          <div className="flex-1">
            {showSearch && (
              <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
                <div className="group relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-space-300" />
                  <input
                    type="text"
                    data-search-input
                    aria-label="Search publications"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-glow w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 transition-colors"
                    placeholder="Search publications…"
                  />
                  <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block">
                    /
                  </kbd>
                </div>
              </form>
            )}
          </div>

          {/* View switcher + links */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 sm:flex">
              <button
                onClick={onHome}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'home' || view === 'results'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Browse
              </button>
              <button
                onClick={onExplore}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'explore' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="h-4 w-4" />
                Explore
              </button>
            </div>

            <a
              href="https://github.com/Azizkhan22/space-biology-knowledge-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              title="GitHub"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
