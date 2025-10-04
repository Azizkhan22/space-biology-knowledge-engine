import { useState } from 'react';
import { Eye, Calendar, Users, Tag, ChevronDown, Filter, Loader } from 'lucide-react';

const SearchResults = ({ publications, selectedPaper, setSelectedPaper, isLoading, isLoadingSuggested, isSearchMode, selectedEntity, searchQuery }) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [filterOpen, setFilterOpen] = useState(false);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'year', label: 'Year' },
    { value: 'title', label: 'Title' }
  ];

  const handlePaperSelect = (paper) => {
    setSelectedPaper(paper);
  };

  // Get display title and description based on current mode
  const getDisplayInfo = () => {
    if (isSearchMode && searchQuery) {
      return {
        title: 'Search Results',
        subtitle: `for "${searchQuery}"`,
        description: 'Publications matching your search query'
      };
    } else if (selectedEntity) {
      return {
        title: 'Related Articles',
        subtitle: `for ${selectedEntity.label}`,
        description: 'Publications related to this research topic'
      };
    } else {
      return {
        title: 'Suggested Articles',
        subtitle: '',
        description: 'Recommended publications based on current research trends'
      };
    }
  };

  const displayInfo = getDisplayInfo();

  if (isLoading || isLoadingSuggested) {
    return (
      <div className="h-full flex flex-col content-update">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {displayInfo.title}
                {displayInfo.subtitle && (
                  <span className="text-sm text-cosmic-300 ml-1">
                    {displayInfo.subtitle}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {displayInfo.description}
              </p>
            </div>
          </div>
        </div>
        {/* Loader at the top */}
        <div className="p-4 pt-8 loading-pulse">
          <div className="flex justify-center items-center w-full">
            <Loader className="h-8 w-8 animate-spin text-cosmic-400 mb-2" />
          </div>
          <p className="text-gray-400 text-center">
            {isLoading && isSearchMode ? 'Searching publications...' :
              isLoading && selectedEntity ? 'Loading related articles...' :
                isLoadingSuggested ? 'Loading suggested articles...' :
                  'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col content-update">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {displayInfo.title}
              {displayInfo.subtitle && (
                <span className="text-sm text-cosmic-300 ml-1">
                  {displayInfo.subtitle}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {displayInfo.description} ({publications.length} publications)
            </p>
          </div>

        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="glass-effect rounded-lg p-4 mb-4 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cosmic-500/50">
                  <option value="all" className="bg-space-800">All Years</option>
                  <option value="2023" className="bg-space-800">2023</option>
                  <option value="2022" className="bg-space-800">2022</option>
                  <option value="2021" className="bg-space-800">2021</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Topic</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cosmic-500/50">
                  <option value="all" className="bg-space-800">All Topics</option>
                  <option value="biology" className="bg-space-800">Biology</option>
                  <option value="health" className="bg-space-800">Health</option>
                  <option value="physics" className="bg-space-800">Physics</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      <div style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE 10+
      }} className="flex-1 overflow-y-auto p-4 space-y-4 list-update max-h-[700px] overflow-y-scroll">
        {publications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg text-gray-400">No publications found</p>
            <p className="text-sm text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          publications.map((paper) => (
            <div
              key={paper.id}
              className={`glass-effect rounded-xl p-4 cursor-pointer transition-all duration-300 card-hover ${selectedPaper?.id === paper.id
                ? 'ring-2 ring-cosmic-500 bg-cosmic-500/10'
                : 'hover:bg-white/5'
                }`}
              onClick={() => handlePaperSelect(paper)}
            >
              <div className="mb-3">
                <h3 className="font-semibold text-white text-sm leading-tight mb-2">
                  {paper.Title}
                </h3>

                <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(paper.PublishedDate).getFullYear()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{paper.Authors?.length || 0} authors</span>
                  </div>                  
                </div>
              </div>

              <p className="text-gray-300 text-xs leading-relaxed mb-4 line-clamp-3">
                {paper.Abstract}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {paper.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gradient-to-r from-cosmic-600/30 to-space-600/30 text-cosmic-200 rounded-full border border-cosmic-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {paper.tags?.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-400 rounded-full">
                      +{paper.tags.length - 3}
                    </span>
                  )}
                </div>

                <button className="flex items-center space-x-1 text-xs text-cosmic-300 hover:text-cosmic-200 transition-colors duration-200">
                  <Eye className="h-3 w-3" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div >
  );
};

export default SearchResults;
