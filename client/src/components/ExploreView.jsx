import { Network, Loader2, MousePointerClick, ArrowLeft } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';
import PublicationCard from './PublicationCard';

const GraphUnavailable = () => (
  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
    <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
      <Network className="h-7 w-7 text-slate-500" />
    </div>
    <h3 className="text-base font-semibold text-white">Knowledge graph unavailable</h3>
    <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400">
      The graph service isn&apos;t connected right now. Semantic search and AI reading still work —
      head back and search the collection.
    </p>
  </div>
);

const ExploreView = ({
  graphData,
  graphStatus,
  selectedEntity,
  onEntityClick,
  entityArticles,
  isLoadingEntity,
  onOpenPaper,
  onBack,
}) => {
  return (
    <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col lg:flex-row">
      {/* Graph */}
      <div className="relative min-h-[440px] flex-1 border-b border-white/8 lg:border-b-0 lg:border-r">
        {graphStatus === 'unavailable' ? (
          <GraphUnavailable />
        ) : (
          <KnowledgeGraph
            graphData={graphData}
            onEntityClick={onEntityClick}
            selectedEntity={selectedEntity}
          />
        )}
      </div>

      {/* Related publications panel */}
      <aside className="flex w-full flex-col bg-base-900/40 lg:w-[380px] xl:w-[420px]">
        <div className="border-b border-white/8 p-5">
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-space-300/90">
            Related publications
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-white">
            {selectedEntity?.label || 'Pick an entity'}
          </h2>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {!selectedEntity ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <MousePointerClick className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-300">Click a node to explore</p>
              <p className="mt-1 text-xs text-slate-500">
                Select any entity in the graph to see the publications connected to it.
              </p>
            </div>
          ) : isLoadingEntity ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-space-400" />
              <p className="text-sm text-slate-400">Loading related publications…</p>
            </div>
          ) : entityArticles.length === 0 ? (
            <p className="px-2 py-12 text-center text-sm text-slate-500">
              No publications linked to this entity.
            </p>
          ) : (
            <div className="space-y-3">
              {entityArticles.map((p) => (
                <PublicationCard key={p.id || p._id} paper={p} variant="list" onOpen={onOpenPaper} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ExploreView;
