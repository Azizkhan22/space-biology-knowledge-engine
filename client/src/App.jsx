import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import Navigation from './components/Navigation';
import HomeView from './components/HomeView';
import ResultsList from './components/ResultsList';
import ExploreView from './components/ExploreView';
import PaperDetails from './components/PaperDetails';
import Footer from './components/Footer';
import SpaceBackground from './components/SpaceBackground';
import CursorEffects from './components/CursorEffects';
import ApiService from './services/api';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024;

function App() {
  const [view, setView] = useState('home'); // 'home' | 'results' | 'explore'
  const [searchQuery, setSearchQuery] = useState('');

  const [suggested, setSuggested] = useState([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchContext, setSearchContext] = useState({ mode: 'browse' });

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [mobileReaderOpen, setMobileReaderOpen] = useState(false);

  const [graphData, setGraphData] = useState(null);
  const [graphStatus, setGraphStatus] = useState('loading'); // 'loading' | 'ready' | 'unavailable'
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityArticles, setEntityArticles] = useState([]);
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);

  const [exploreScope, setExploreScope] = useState('global'); // 'global' | 'article'
  const [articleGraph, setArticleGraph] = useState(null); // { article, data }
  const [isLoadingArticleGraph, setIsLoadingArticleGraph] = useState(false);

  const [searchError, setSearchError] = useState(null);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sbke:recent') || '[]');
    } catch {
      return [];
    }
  });

  const pushRecent = useCallback((q) => {
    setRecent((prev) => {
      const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('sbke:recent', JSON.stringify(next));
      } catch {
        /* ignore quota / privacy-mode errors */
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem('sbke:recent');
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------------------------------------------------------------- loaders */
  const loadSuggested = useCallback(async () => {
    setIsLoadingSuggested(true);
    try {
      const res = await ApiService.getSuggestedArticles();
      setSuggested(res.success ? res.data : []);
    } catch {
      setSuggested([]);
    } finally {
      setIsLoadingSuggested(false);
    }
  }, []);

  const loadGraph = useCallback(async () => {
    setGraphStatus('loading');
    try {
      const res = await ApiService.getKnowledgeGraph();
      const data = res?.data;
      const ready = res?.success && data && ((data.entities?.length || 0) + (data.nodes?.length || 0) > 0);
      if (ready) {
        setGraphData(data);
        setGraphStatus('ready');
      } else {
        setGraphStatus('unavailable');
      }
    } catch {
      setGraphStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    loadSuggested();
    loadGraph();
  }, [loadSuggested, loadGraph]);

  /* -------------------------------------------------------------- navigation */
  const goHome = useCallback(() => {
    setView('home');
    setSelectedEntity(null);
    setMobileReaderOpen(false);
    setSearchQuery('');
  }, []);

  const goExplore = useCallback(() => {
    setExploreScope('global');
    setSelectedEntity(null);
    setView('explore');
    setMobileReaderOpen(false);
  }, []);

  const backToReading = useCallback(() => {
    setExploreScope('global');
    setView('results');
  }, []);

  const handleExploreArticle = useCallback(async (paper) => {
    if (!paper?._id) return;
    setExploreScope('article');
    setArticleGraph({ article: paper, data: null });
    setSelectedEntity(null);
    setEntityArticles([]);
    setMobileReaderOpen(false);
    setView('explore');
    setIsLoadingArticleGraph(true);
    try {
      const res = await ApiService.getArticleGraph(paper._id);
      setArticleGraph({ article: paper, data: res.success ? res.data : { entities: [], relations: [] } });
    } catch {
      setArticleGraph({ article: paper, data: { entities: [], relations: [] } });
    } finally {
      setIsLoadingArticleGraph(false);
    }
  }, []);

  /* ------------------------------------------------------------------ search */
  const runSearch = useCallback(async (query) => {
    const q = (query ?? '').trim();
    setSearchQuery(query ?? '');
    if (!q) {
      goHome();
      return;
    }
    setView('results');
    setSearchContext({ mode: 'search', query: q });
    setSelectedEntity(null);
    setMobileReaderOpen(false);
    setSearchError(null);
    setIsLoading(true);
    try {
      const res = await ApiService.searchArticles(q);
      if (res.success) {
        setResults(res.data);
        setSelectedPaper(res.data[0] || null);
        pushRecent(q);
      } else {
        setResults([]);
        setSelectedPaper(null);
        setSearchError(res.error || 'Search failed. Please try again.');
      }
    } catch {
      setResults([]);
      setSelectedPaper(null);
      setSearchError('Could not reach the server. Make sure the API is running.');
    } finally {
      setIsLoading(false);
    }
  }, [goHome, pushRecent]);

  const handleChip = useCallback((c) => runSearch(c), [runSearch]);

  /* ------------------------------------------------------------ paper opening */
  const openFromHome = useCallback((paper) => {
    setResults(suggested);
    setSearchContext({ mode: 'browse' });
    setSelectedPaper(paper);
    setView('results');
    if (isMobile()) setMobileReaderOpen(true);
  }, [suggested]);

  const selectFromList = useCallback((paper) => {
    setSelectedPaper(paper);
    if (isMobile()) setMobileReaderOpen(true);
  }, []);

  /* --------------------------------------------------------- graph exploration */
  const handleEntityClick = useCallback(async (entity) => {
    setSelectedEntity(entity);
    setIsLoadingEntity(true);
    setEntityArticles([]);
    try {
      const res = await ApiService.getArticlesByIds(entity.articleIds || []);
      setEntityArticles(res.success ? res.data : []);
    } catch {
      setEntityArticles([]);
    } finally {
      setIsLoadingEntity(false);
    }
  }, []);

  const openFromExplore = useCallback((paper) => {
    setResults(entityArticles);
    setSearchContext({ mode: 'entity', entity: selectedEntity });
    setSelectedPaper(paper);
    setView('results');
    if (isMobile()) setMobileReaderOpen(true);
  }, [entityArticles, selectedEntity]);

  // Keyboard shortcuts: "/" or Ctrl/Cmd+K focuses search; Esc steps back.
  // (Declared after the callbacks it references to avoid a TDZ error.)
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const input = document.querySelector('[data-search-input]');
        if (input) {
          input.focus();
          input.select?.();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (typing) {
          e.target.blur();
        } else if (mobileReaderOpen) {
          setMobileReaderOpen(false);
        } else if (view === 'explore') {
          exploreScope === 'article' ? backToReading() : goHome();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileReaderOpen, view, exploreScope, backToReading, goHome]);

  /* ------------------------------------------------------------------- render */
  const heroProps = {
    searchQuery,
    setSearchQuery,
    onSearch: runSearch,
    onChip: handleChip,
    stats: { topics: graphStatus === 'ready' ? graphData?.entities?.length : null },
    recent,
    onRecent: runSearch,
    onClearRecent: clearRecent,
  };

  return (
    <div className="relative text-white">
      <SpaceBackground />
      <CursorEffects />

      <div className="relative z-10 flex h-[100dvh] flex-col">
        <Navigation
          view={view}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={runSearch}
          onHome={goHome}
          onExplore={goExplore}
        />

        <main className={`min-h-0 flex-1 ${view === 'home' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {view === 'home' && (
            <>
              <HomeView
                hero={heroProps}
                suggested={suggested}
                isLoading={isLoadingSuggested}
                onOpenPaper={openFromHome}
                onExplore={goExplore}
              />
              <Footer />
            </>
          )}

          {view === 'results' && (
            <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(340px,380px)_1fr]">
              <div className="min-h-0 overflow-hidden border-r border-white/8 bg-base-900/40">
                <ResultsList
                  publications={results}
                  selectedPaper={selectedPaper}
                  onSelect={selectFromList}
                  isLoading={isLoading}
                  context={searchContext}
                  error={searchContext.mode === 'search' ? searchError : null}
                  onRetry={() => runSearch(searchContext.query)}
                />
              </div>
              <div className="hidden min-h-0 overflow-hidden bg-base-900/20 lg:block">
                <div className="mx-auto h-full w-full max-w-4xl">
                  <PaperDetails paper={selectedPaper} onExploreArticle={handleExploreArticle} />
                </div>
              </div>
            </div>
          )}

          {view === 'explore' && (
            <ExploreView
              graphData={exploreScope === 'article' ? articleGraph?.data : graphData}
              graphStatus={
                exploreScope === 'article'
                  ? isLoadingArticleGraph || !articleGraph?.data
                    ? 'loading'
                    : articleGraph.data.entities?.length
                    ? 'ready'
                    : 'unavailable'
                  : graphStatus
              }
              eyebrow={exploreScope === 'article' ? 'Article graph' : 'Explore'}
              title={exploreScope === 'article' ? 'Entities in this paper' : 'Knowledge Graph'}
              subtitle={
                exploreScope === 'article'
                  ? articleGraph?.article?.Title
                  : 'Top biomedical entities across the corpus'
              }
              selectedEntity={selectedEntity}
              onEntityClick={handleEntityClick}
              entityArticles={entityArticles}
              isLoadingEntity={isLoadingEntity}
              onOpenPaper={openFromExplore}
              onBack={exploreScope === 'article' ? backToReading : goHome}
            />
          )}
        </main>
      </div>

      {/* Mobile reader overlay */}
      {mobileReaderOpen && selectedPaper && (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-900 lg:hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
            <button
              onClick={() => setMobileReaderOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Results
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <PaperDetails paper={selectedPaper} onExploreArticle={handleExploreArticle} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
