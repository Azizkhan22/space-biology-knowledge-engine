import { ExternalLink, Github, Rocket } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-space-900/95 to-cosmic-900/95 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cosmic-500 to-space-600 rounded-lg shadow-lg">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold bg-gradient-to-r from-cosmic-300 to-space-300 bg-clip-text text-transparent">
                NASA BioSpace Knowledge Engine
              </h3>
              <p className="text-xs text-gray-400">
                Exploring 608 NASA bioscience publications
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://www.spaceappschallenge.org/2025/challenges/build-a-space-biology-knowledge"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
            >
              <span>About</span>
            </a>
            
            <a
              href="#team"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Team</span>
            </a>
            
            <a
              href="https://www.spaceappschallenge.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
            >
              <span>NASA Space Apps Challenge</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <a
              href="https://github.com/Azizkhan22/space-biology-knowledge-engine"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="text-xs text-gray-500">
            © 2025 NASA BioSpace Knowledge Engine. Built for NASA Space Apps Challenge.
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Awarded 1st Place 🏆 at the Nasa Space Apss Challenge Hackathon.</span>
            <div className="flex items-center space-x-1">
              <span>Designed and Developed by Team DEIBYTE</span>              
            </div>
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="absolute bottom-4 left-10 w-1 h-1 bg-white rounded-full animate-twinkle opacity-60"></div>
        <div className="absolute bottom-8 right-20 w-0.5 h-0.5 bg-cosmic-300 rounded-full animate-twinkle opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-12 left-1/3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle opacity-50" style={{animationDelay: '2s'}}></div>
      </div>
    </footer>
  );
};

export default Footer;
