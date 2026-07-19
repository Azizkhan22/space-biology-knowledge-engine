import { useMemo, useState, useEffect } from 'react';
import { FileSearch, SlidersHorizontal } from 'lucide-react';
import PublicationCard from './PublicationCard';

const ListSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 loading-pulse">
        <div className="mb-3 h-3.5 w-4/5 rounded bg-white/10" />
        <div className="mb-3 h-2.5 w-1/3 rounded bg-white/5" />
        <div className="h-2.5 w-full rounded bg-white/5" />
      </div>
    ))}
  </div>
);

const ResultsList = ({ publications, selectedPaper, onSelect, isLoading, context }) => {
  const [year, setYear] = useState('all');
  const [topic, setTopic] = useState('all');

  // Reset filters whenever the underlying result set changes.
  useEffect(() => {
    setYear('all');
    setTopic('all');
  }, [context?.query, context?.entity?.id, context?.mode]);

  const years = useMemo(() => {
    const s = new Set();
    publications.forEach((p) => {
      const y = p.PublishedDate && new Date(p.PublishedDate).getFullYear();
      if (y && !Number.isNaN(y)) s.add(y);
    });
    return [...s].sort((a, b) => b - a);
  }, [publications]);

  const topics = useMemo(() => {
    const s = new Set();
    publications.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [publications]);

  const filtered = useMemo(
    () =>
      publications.filter((p) => {
        const y = p.PublishedDate && new Date(p.PublishedDate).getFullYear();
        if (year !== 'all' && String(y) !== year) return false;
        if (topic !== 'all' && !p.tags?.includes(topic)) return false;
        return true;
      }),
    [publications, year, topic]
  );

  const header = (() => {
    if (context?.mode === 'search')
      return { eyebrow: 'Search results', title: `“${context.query}”`, sub: 'Ranked by semantic relevance' };
    if (context?.mode === 'entity')
      return { eyebrow: 'Related publications', title: context.entity?.label || 'Entity', sub: 'Linked in the knowledge graph' };
    return { eyebrow: 'Library', title: 'Suggested publications', sub: 'Recent NASA bioscience research' };
  })();

  const showFilters = !isLoading && publications.length > 0 && (years.length > 1 || topics.length > 1);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/8 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-space-300/90">
          {header.eyebrow}
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold text-white" title={header.title}>
          {header.title}
        </h2>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
          <span>{header.sub}</span>
          {!isLoading && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">{filtered.length} results</span>
            </>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 focus:border-space-400 focus:outline-none"
            >
              <option value="all" className="bg-base-800">All years</option>
              {years.map((y) => (
                <option key={y} value={String(y)} className="bg-base-800">
                  {y}
                </option>
              ))}
            </select>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 focus:border-space-400 focus:outline-none"
            >
              <option value="all" className="bg-base-800">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t} className="bg-base-800">
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
            <FileSearch className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-200">No publications found</p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            {publications.length > 0
              ? 'No results match the selected filters.'
              : 'Try a different search term, or explore the knowledge graph.'}
          </p>
        </div>
      ) : (
        <div
          className="flex-1 space-y-3 overflow-y-auto p-4 list-update"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filtered.map((paper) => (
            <PublicationCard
              key={paper.id || paper._id}
              paper={paper}
              variant="list"
              active={selectedPaper?._id === paper._id || selectedPaper?.id === paper.id}
              showScore={context?.mode === 'search'}
              onOpen={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsList;
