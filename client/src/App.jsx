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
    setView('explore');
    setMobileReaderOpen(false);
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
    setIsLoading(true);
    try {
      const res = await ApiService.searchArticles(q);
      const data = res.success ? res.data : [];
      setResults(data);
      setSelectedPaper(data[0] || null);
    } catch {
      setResults([]);
      setSelectedPaper(null);
    } finally {
      setIsLoading(false);
    }
  }, [goHome]);

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

  /* ------------------------------------------------------------------- render */
  const heroProps = {
    searchQuery,
    setSearchQuery,
    onSearch: runSearch,
    onChip: handleChip,
    stats: { topics: graphStatus === 'ready' ? graphData?.entities?.length : null },
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
                />
              </div>
              <div className="hidden min-h-0 overflow-hidden bg-base-900/20 lg:block">
                <div className="mx-auto h-full w-full max-w-4xl">
                  <PaperDetails paper={selectedPaper} />
                </div>
              </div>
            </div>
          )}

          {view === 'explore' && (
            <ExploreView
              graphData={graphData}
              graphStatus={graphStatus}
              selectedEntity={selectedEntity}
              onEntityClick={handleEntityClick}
              entityArticles={entityArticles}
              isLoadingEntity={isLoadingEntity}
              onOpenPaper={openFromExplore}
              onBack={goHome}
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
            <PaperDetails paper={selectedPaper} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
