import { Calendar, Users, ArrowRight } from 'lucide-react';

const yearOf = (p) => {
  const d = p.PublishedDate ? new Date(p.PublishedDate) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : '—';
};

/**
 * Reusable publication card.
 * - variant "grid" (default): roomy card for the home grid.
 * - variant "list": compact card for the results rail.
 */
const PublicationCard = ({ paper, onOpen, active = false, variant = 'grid', showScore = false }) => {
  const compact = variant === 'list';
  const score = typeof paper.score === 'number' ? Math.round(paper.score * 100) : null;

  return (
    <article
      onClick={() => onOpen?.(paper)}
      className={`card-hover group flex cursor-pointer flex-col rounded-xl border p-4 ${
        compact ? '' : 'h-full'
      } ${
        active
          ? 'border-space-500/60 bg-space-500/[0.08]'
          : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        <h3
          className={`flex-1 font-semibold leading-snug text-white ${
            compact ? 'text-sm line-clamp-3' : 'text-[15px] line-clamp-2'
          }`}
        >
          {paper.Title}
        </h3>
        {showScore && score !== null && (
          <span className="shrink-0 rounded-md bg-cosmic-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-cosmic-200 tabular-nums">
            {score}%
          </span>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {yearOf(paper)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {paper.Authors?.length || 0} authors
        </span>
      </div>

      <p className={`text-xs leading-relaxed text-slate-400 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
        {paper.Abstract}
      </p>

      {paper.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {paper.tags.slice(0, compact ? 2 : 4).map((tag, i) => (
            <span
              key={i}
              className="rounded-md border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-slate-300"
            >
              {tag}
            </span>
          ))}
          {paper.tags.length > (compact ? 2 : 4) && (
            <span className="px-1 py-0.5 text-[10px] text-slate-500">
              +{paper.tags.length - (compact ? 2 : 4)}
            </span>
          )}
        </div>
      )}

      {!compact && (
        <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-space-300 opacity-0 transition-opacity group-hover:opacity-100">
          Read paper
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </article>
  );
};

export default PublicationCard;
