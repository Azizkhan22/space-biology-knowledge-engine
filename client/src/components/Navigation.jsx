import { useState } from 'react';
import { Search, Rocket, Menu, X } from 'lucide-react';

const Navigation = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav className="relative bg-gradient-to-r from-space-900/95 to-cosmic-900/95 backdrop-blur-lg border-b border-white/10">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-4 left-20 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
        <div className="absolute top-8 right-32 w-1 h-1 bg-cosmic-300 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-12 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-6 right-1/4 w-0.5 h-0.5 bg-space-300 rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cosmic-500 to-space-600 rounded-lg shadow-lg">
              <Rocket className="h-6 w-6 text-white animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cosmic-300 to-space-300 bg-clip-text text-transparent">
                NASA BioSpace
              </h1>
              <p className="text-xs text-gray-400">Knowledge Engine</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none search-glow transition-all duration-300"
                  placeholder="Search 608 NASA bioscience publications..."
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic-500/20 to-space-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <a href='https://www.spaceappschallenge.org/2025/challenges/build-a-space-biology-knowledge-engine/' className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              About
            </a>
            <button className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Team
            </button>
            <button className="space-button text-sm">
              NASA Space Apps
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              //onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none search-glow transition-all duration-300"
                placeholder="Search publications..."
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-space-900/98 backdrop-blur-lg border-b border-white/10 z-50">
          <div className="px-4 py-4 space-y-4">
            <button className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
              About
            </button>
            <button className="block w-full text-left text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
              Team
            </button>
            <button className="space-button text-sm w-full">
              NASA Space Apps Challenge
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
