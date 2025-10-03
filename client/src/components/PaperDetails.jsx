import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  Tag, 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  Share2, 
  Bookmark,
  Loader,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send
} from 'lucide-react';
import ApiService from '../services/api';
import { askAI } from '../services/aiChat';

const PaperDetails = ({ paper, onGenerateAISummary, isGeneratingAI }) => {
  const [activeTab, setActiveTab] = useState('abstract');
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [copied, setCopied] = useState(false); // <-- Copy feedback state
  const chatContainerRef = useRef(null);

  // Reset chat messages when paper changes
  useEffect(() => {
    setChatMessages([]);
  }, [paper?.id]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAskingAI]);

  if (!paper) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cosmic-500/20 to-space-500/20 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-cosmic-300" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Select a Publication
          </h3>
          <p className="text-gray-400 text-sm">
            Choose a paper from the search results to view detailed information, abstracts, and AI-generated summaries.
          </p>
        </div>
      </div>
    );
  }

  // Handle AI question submission
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isAskingAI) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsAskingAI(true);

    // Add user question to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await ApiService.askAIQuestion(paper.id, question, paper);
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.answer,
          confidence: response.data.confidence,
          sources: response.data.sources,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: 'Sorry, I encountered an error while processing your question. Please try again.',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAskingAI(false);
    }
  };

  // Copy article URL to clipboard
  const handleCopyUrl = () => {
    if (paper.url) {
      navigator.clipboard.writeText(paper.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const tabs = [
    { id: 'abstract', label: 'Read', icon: BookOpen },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  ];

  return (
    <div className="h-full flex flex-col content-update">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Paper Details</h2>
          
          <div className="flex items-center space-x-2">
            {/* Copy URL button */}
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 relative"
              title={paper.url ? "Copy Article Link" : "No link available"}
              onClick={handleCopyUrl}
              disabled={!paper.url}
            >
              <Share2 className="h-4 w-4 text-gray-400" />
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cosmic-600 text-white text-xs rounded px-2 py-1 shadow-lg z-10">
                  Copied!
                </span>
              )}
            </button>
          
            {/* External link button */}
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              title={paper.url ? "Open Article in New Tab" : "No link available"}
              onClick={() => paper.url && window.open("https://www.google.com", '_blank', 'noopener,noreferrer')}
              disabled={!paper.url}
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white leading-tight mb-4">
          {paper.title}
        </h1>

        {/* Metadata */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Users className="h-4 w-4 text-cosmic-400" />
            <span>{paper.authors.join(', ')}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-cosmic-400" />
              <span>{paper.year}</span>
            </div>            
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs bg-gradient-to-r from-cosmic-600/30 to-space-600/30 text-cosmic-200 rounded-full border border-cosmic-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cosmic-600 to-space-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE 10+
      }} className="flex-1 overflow-y-auto p-4 max-h-[600px] overflow-y-scroll">
        {activeTab === 'abstract' && (
          <div className="space-y-4 content-update">
            {/* Abstract Section */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Abstract</h3>
              <div className="relative">
                <p className={`text-gray-300 leading-relaxed ${
                  !isAbstractExpanded && paper.abstract.length > 500 ? 'line-clamp-6' : ''
                }`}>
                  {paper.abstract}
                </p>
                
                {paper.abstract.length > 500 && (
                  <button
                    onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                    className="mt-3 flex items-center space-x-1 text-cosmic-300 hover:text-cosmic-200 transition-colors duration-200 text-sm"
                  >
                    {isAbstractExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Show less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>Read more</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Methodology Section - Only show if data is available */}
            {paper.methodology && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Methodology</h3>
                <p className="text-gray-300 leading-relaxed">
                  {paper.methodology}
                </p>
              </div>
            )}

            {/* Key Findings Section - Only show if data is available */}
            {paper.keyFindings && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
                <div className="space-y-3">
                  {Array.isArray(paper.keyFindings) ? (
                    paper.keyFindings.map((finding, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">{finding}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300 leading-relaxed">{paper.keyFindings}</p>
                  )}
                </div>
              </div>
            )}

            {/* Implications Section - Only show if data is available */}
            {paper.implications && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Implications</h3>
                <p className="text-gray-300 leading-relaxed">
                  {paper.implications}
                </p>
              </div>
            )}

            {/* Research Context Section - Only show if data is available */}
            {paper.researchContext && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Research Context</h3>
                <p className="text-gray-300 leading-relaxed">
                  {paper.researchContext}
                </p>
              </div>
            )}

            {/* Future Work Section - Only show if data is available */}
            {paper.futureWork && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Future Work</h3>
                <p className="text-gray-300 leading-relaxed">
                  {paper.futureWork}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4 content-update">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AI Summary</h3>
                <button
                  onClick={() => onGenerateAISummary && onGenerateAISummary(paper)}
                  disabled={isGeneratingAI}
                  className="space-button text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-cosmic-900/30 to-space-900/30 rounded-lg p-4 border border-cosmic-500/30 min-h-[200px]">
                {paper.aiSummary ? (
                  <p className="text-gray-300 leading-relaxed">
                    {paper.aiSummary}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[150px]">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-2">
                        No AI summary generated yet
                      </p>
                      <p className="text-gray-500 text-xs">
                        Click "Generate Summary" to create an AI-powered summary of this research paper
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col space-y-4 content-update">
            {/* Chat Header */}
            <div className="glass-effect rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-5 w-5 text-cosmic-400" />
                <h3 className="text-lg font-semibold text-white">AI Research Assistant</h3>
              </div>
              <p className="text-sm text-gray-400">
                Ask questions about this research paper and get AI-powered insights.
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 glass-effect rounded-xl p-4 overflow-hidden flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#521887 rgba(26, 26, 46, 0.3)"
                }}
              >
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      Start a conversation by asking a question about this research paper.
                    </p>
                    <div className="mt-4 space-y-2 text-xs text-gray-500">
                      <p>• "What are the main findings?"</p>
                      <p>• "How does this relate to previous research?"</p>
                      <p>• "What are the implications for space missions?"</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-4 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-cosmic-600 to-cosmic-500 text-white shadow-lg'
                            : message.type === 'error'
                            ? 'bg-red-600/20 border border-red-500/30 text-red-200 rounded-xl'
                            : 'bg-gradient-to-r from-space-800/80 to-space-700/80 border border-space-600/30 text-gray-200 shadow-lg rounded-xl'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isAskingAI && (
                  <div className="flex justify-start">
                    <div className="bg-space-800/50 border border-space-600/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin text-cosmic-400" />
                        <span className="text-sm text-gray-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskAI} className="flex space-x-2">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Ask a question about this research paper..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cosmic-500/50 focus:border-cosmic-400 text-sm"
                  disabled={isAskingAI}
                />
                <button
                  type="submit"
                  disabled={!currentQuestion.trim() || isAskingAI}
                  className="px-4 py-2 bg-cosmic-600 hover:bg-cosmic-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperDetails;
