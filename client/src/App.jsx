import { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from './components/Navigation';
import SearchResults from './components/SearchResults';
import KnowledgeGraph from './components/KnowledgeGraph';
import PaperDetails from './components/PaperDetails';
import Footer from './components/Footer';
import SpaceBackground from './components/SpaceBackground';
import ApiService from './services/api';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  const paperDetailsRef = useRef(null);
  const searchResultsRef = useRef(null);

  const smoothScrollTo = useCallback((element, offset = 0) => {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, []);
  
  const isMobileOrTablet = useCallback(() => {
    return window.innerWidth < 1024; 
  }, []);
  
  const handleSearch = async (query) => {
    setIsLoading(true);
    setIsSearchMode(true);
    setSelectedEntity(null);
    
    try {
      if (!query.trim()) {        
        setIsSearchMode(false);
        await loadSuggestedArticles();
      } else {        
        const response = await ApiService.searchArticles(query);
        if (response.success) {
          setFilteredPublications(response.data);
        } else {
          console.error('Search failed:', response.error);
          setFilteredPublications([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setFilteredPublications([]);
    } finally {
      setIsLoading(false);
    }
    
    if (query.trim() && isMobileOrTablet() && searchResultsRef.current) {
      smoothScrollTo(searchResultsRef.current, 80);
    }
  };

  const loadSuggestedArticles = async () => {
    setIsLoadingSuggested(true);
    try {
      const response = await ApiService.getSuggestedArticles();
      if (response.success) {
        setFilteredPublications(response.data);
      } else {
        console.error('Failed to load suggested articles:', response.error);        
        setFilteredPublications(mockPublications.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading suggested articles:', error);
      setFilteredPublications(mockPublications.slice(0, 5));
    } finally {
      setIsLoadingSuggested(false);
    }
  };
  
  const loadKnowledgeGraph = async () => {
    try {
      const response = await ApiService.getKnowledgeGraph();
      if (response.success) {
        setKnowledgeGraphData(response.data);
      } else {
        console.error('Failed to load knowledge graph:', response.error);
      }
    } catch (error) {
      console.error('Error loading knowledge graph:', error);
    }
  };
  
  const handleEntityClick = useCallback(async (entity) => {
    setSelectedEntity(entity);
    setIsSearchMode(false);
    setIsLoading(true);
    console.log(entity.articleIds);
    try {
      const response = await ApiService.getArticlesByIds(entity.articleIds);      
      if (response.success) {
        setFilteredPublications(response.data);
      } else {
        console.error('Failed to load articles for entity:', response.error);
        setFilteredPublications([]);
      }
    } catch (error) {
      console.error('Error loading articles for entity:', error);
      setFilteredPublications([]);
    } finally {
      setIsLoading(false);
    }
  
    if (isMobileOrTablet() && searchResultsRef.current) {
      setTimeout(() => {
        smoothScrollTo(searchResultsRef.current, 80);
      }, 100);
    }
  }, [isMobileOrTablet, smoothScrollTo]);
  
  const handlePaperSelect = useCallback((paper) => {
    setSelectedPaper(paper);
      
    if (isMobileOrTablet() && paperDetailsRef.current) {
      setTimeout(() => {
        smoothScrollTo(paperDetailsRef.current, 80);
      }, 100);
    }
  }, [isMobileOrTablet, smoothScrollTo]);
  
  const handleGenerateAISummary = async (paper) => {
    setIsGeneratingAI(true);
    
    try {
      const response = await ApiService.generateAISummary(paper.id, paper);
      
      if (response.success) {        
        setSelectedPaper(prev => ({
          ...prev,
          aiSummary: response.data.summary
        }));
                
        setFilteredPublications(prev => 
          prev.map(p => 
            p.id === paper.id ? { ...p, aiSummary: response.data.summary } : p
          )
        );
      } else {
        console.error('Failed to generate AI summary:', response.error);
      }
    } catch (error) {
      console.error('Error generating AI summar//', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  useEffect(() => {
    loadSuggestedArticles();
    loadKnowledgeGraph();
  }, []);
  
  useEffect(() => {
    if (filteredPublications.length > 0 && !selectedPaper) {
      setSelectedPaper(filteredPublications[0]);
    }
  }, [filteredPublications, selectedPaper]);

  return (
    <div className="min-h-screen text-white" style={{background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'}}>
      {/* Enhanced Space Background */}
      <SpaceBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <Navigation 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col lg:flex-row">
          {/* Mobile Layout: Knowledge Graph First, then Search Results, then Paper Details */}
          {/* Desktop Layout: Search Results, Knowledge Graph, Paper Details */}
          
          {/* Knowledge Graph Panel - Top on mobile, Center on desktop */}
          <div className="w-full lg:w-1/3 xl:w-2/5 border-r border-white/10 bg-black/10 graph-update order-1 lg:order-2 h-100 lg:h-auto">
            <KnowledgeGraph
              selectedPaper={selectedPaper}
              publications={filteredPublications}
              graphData={knowledgeGraphData}
              onEntityClick={handleEntityClick}
              selectedEntity={selectedEntity}
            />
          </div>

          {/* Search Results Panel - Middle on mobile, Left on desktop */}
          <div ref={searchResultsRef} className="w-full lg:w-1/3 xl:w-1/4 border-r border-white/10 bg-black/20 backdrop-blur-sm panel-update order-2 lg:order-1">
            <SearchResults
              publications={filteredPublications}
              selectedPaper={selectedPaper}
              setSelectedPaper={handlePaperSelect}
              isLoading={isLoading}
              isLoadingSuggested={isLoadingSuggested}
              isSearchMode={isSearchMode}
              selectedEntity={selectedEntity}
              searchQuery={searchQuery}
            />
          </div>

          {/* Paper Details Panel - Bottom on mobile, Right on desktop */}
          <div ref={paperDetailsRef} className="w-full lg:w-1/3 xl:w-1/3 bg-black/20 backdrop-blur-sm panel-update order-3 lg:order-3">
            <PaperDetails
              paper={selectedPaper}
              onGenerateAISummary={handleGenerateAISummary}
              isGeneratingAI={isGeneratingAI}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
