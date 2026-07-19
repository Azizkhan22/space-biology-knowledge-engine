import { Network, ArrowRight } from 'lucide-react';
import Hero from './Hero';
import PublicationCard from './PublicationCard';

const CardSkeleton = () => (
  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 loading-pulse">
    <div className="mb-3 h-4 w-3/4 rounded bg-white/10" />
    <div className="mb-3 h-3 w-1/3 rounded bg-white/5" />
    <div className="space-y-1.5">
      <div className="h-2.5 w-full rounded bg-white/5" />
      <div className="h-2.5 w-5/6 rounded bg-white/5" />
      <div className="h-2.5 w-2/3 rounded bg-white/5" />
    </div>
  </div>
);

const HomeView = ({ hero, suggested, isLoading, onOpenPaper, onExplore }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
    <Hero {...hero} />

    {/* Explore knowledge graph — call to action */}
    <button
      onClick={onExplore}
      className="reveal group mb-14 flex w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-gradient-to-r from-space-500/[0.08] to-cosmic-500/[0.08] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-space-400/40 hover:from-space-500/[0.12] hover:to-cosmic-500/[0.12]"
      style={{ animationDelay: '0.52s' }}
    >
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
          <Network className="h-5 w-5 text-space-300" />
        </span>
        <div>
          <div className="font-semibold text-white">Explore the knowledge graph</div>
          <div className="text-sm text-slate-400">
            See how topics, organisms, and findings connect across the corpus.
          </div>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
    </button>

    {/* Suggested reading */}
    <div className="reveal mb-4" style={{ animationDelay: '0.58s' }}>
      <h2 className="text-lg font-semibold text-white">Suggested reading</h2>
      <p className="text-sm text-slate-400">Recent publications from the collection</p>
    </div>

    <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        : suggested.map((p, i) => (
            <div
              key={p.id || p._id}
              className="reveal"
              style={{ animationDelay: `${0.62 + Math.min(i, 8) * 0.05}s` }}
            >
              <PublicationCard paper={p} onOpen={onOpenPaper} />
            </div>
          ))}
      {!isLoading && suggested.length === 0 && (
        <p className="col-span-full py-12 text-center text-sm text-slate-500">
          Couldn&apos;t load publications. Make sure the API server is running.
        </p>
      )}
    </div>
  </div>
);

export default HomeView;
