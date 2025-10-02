import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import SearchResults from './components/SearchResults';
import KnowledgeGraph from './components/KnowledgeGraph';
import PaperDetails from './components/PaperDetails';
import Footer from './components/Footer';
import SpaceBackground from './components/SpaceBackground';
import { mockPublications } from './data/mockData';
import ApiService from './services/api';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Handle search functionality
  const handleSearch = async (query) => {
    setIsLoading(true);
    setIsSearchMode(true);
    setSelectedEntity(null);
    
    try {
      if (!query.trim()) {
        // If empty query, load suggested articles
        setIsSearchMode(false);
        await loadSuggestedArticles();
      } else {
        // Search for articles using API
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
  };

  // Load suggested articles for normal state
  const loadSuggestedArticles = async () => {
    try {
      const response = await ApiService.getSuggestedArticles();
      if (response.success) {
        setFilteredPublications(response.data);
      } else {
        console.error('Failed to load suggested articles:', response.error);
        // Fallback to mock data
        setFilteredPublications(mockPublications.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading suggested articles:', error);
      setFilteredPublications(mockPublications.slice(0, 5));
    }
  };

  // Load knowledge graph data
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

  // Handle entity click in knowledge graph
  const handleEntityClick = useCallback(async (entity) => {
    setSelectedEntity(entity);
    setIsSearchMode(false);
    setIsLoading(true);
    
    try {
      const response = await ApiService.getArticlesByEntity(entity.id, entity.label);
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
  }, []); // Empty dependency array since this function doesn't depend on any state that changes

  // Handle AI summary generation
  const handleGenerateAISummary = async (paper) => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      // In a real app, this would call an AI API
      console.log('Generating AI summary for:', paper.title);
      setIsGeneratingAI(false);
    }, 2000);
  };

  // Initialize app data
  useEffect(() => {
    loadSuggestedArticles();
    loadKnowledgeGraph();
  }, []);

  // Auto-select first paper when publications change
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
          {/* Left Panel - Search Results */}
          <div className="w-full lg:w-1/3 xl:w-1/4 border-r border-white/10 bg-black/20 backdrop-blur-sm panel-update">
            <SearchResults
              publications={filteredPublications}
              selectedPaper={selectedPaper}
              setSelectedPaper={setSelectedPaper}
              isLoading={isLoading}
              isSearchMode={isSearchMode}
              selectedEntity={selectedEntity}
              searchQuery={searchQuery}
            />
          </div>

          {/* Center Panel - Knowledge Graph */}
          <div className="w-full lg:w-1/3 xl:w-2/5 border-r border-white/10 bg-black/10 backdrop-blur-sm graph-update">
            <KnowledgeGraph
              selectedPaper={selectedPaper}
              publications={filteredPublications}
              graphData={knowledgeGraphData}
              onEntityClick={handleEntityClick}
              selectedEntity={selectedEntity}
            />
          </div>

          {/* Right Panel - Paper Details */}
          <div className="w-full lg:w-1/3 xl:w-1/3 bg-black/20 backdrop-blur-sm panel-update">
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
