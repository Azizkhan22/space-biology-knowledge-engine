import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  ExternalLink,
  Share2,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  Check,
  Network,
  Quote,
} from 'lucide-react';
import ApiService from '../services/api';

const hasText = (v) => v && v !== 'Not Found' && String(v).trim().length > 0;

const CollapsibleSection = ({ title, text }) => {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 500;
  return (
    <section className="glass-effect rounded-xl p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-space-300/90">
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed text-slate-300 ${
          !expanded && long ? 'line-clamp-6' : ''
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-space-300 transition-colors hover:text-space-200"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </section>
  );
};

const PaperDetails = ({ paper, onExploreArticle }) => {
  const [activeTab, setActiveTab] = useState('abstract');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [citeCopied, setCiteCopied] = useState(false);
  const chatContainerRef = useRef(null);
  const [aiSummary, setAiSummary] = useState(paper?.aiSummary || '');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    setChatMessages([]);
    setActiveTab('abstract');
  }, [paper?._id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAskingAI]);

  useEffect(() => {
    setAiSummary(paper?.aiSummary || '');
  }, [paper?._id, paper?.aiSummary]);

  if (!paper) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-xs text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-space-500/15 to-cosmic-500/15 ring-1 ring-white/8">
            <BookOpen className="h-7 w-7 text-space-300" />
          </div>
          <h3 className="mb-1.5 text-base font-semibold text-white">Select a publication</h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Choose a paper from the results to read its abstract, generate an AI summary, or ask
            questions about it.
          </p>
        </div>
      </div>
    );
  }

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isAskingAI) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsAskingAI(true);
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', content: question },
    ]);

    try {
      const response = await ApiService.askAIQuestion(paper._id, question, paper);
      if (response.success) {
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, type: 'ai', content: response.data.answer },
        ]);
      } else {
        throw new Error('request failed');
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'error',
          content: 'Sorry, something went wrong while processing your question. Please try again.',
        },
      ]);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleGenerateAISummary = async () => {
    if (!paper?._id || isGeneratingSummary) return;
    setIsGeneratingSummary(true);
    try {
      const response = await ApiService.generateAISummary(paper._id, paper);
      setAiSummary(
        response.success && response.data?.summary
          ? response.data.summary
          : 'Failed to generate summary. Please try again.'
      );
    } catch {
      setAiSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopyUrl = () => {
    if (!paper.Link) return;
    navigator.clipboard.writeText(paper.Link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyCitation = () => {
    const authors = paper.Authors?.length ? paper.Authors.join(', ') : 'Unknown authors';
    const year = paper.PublishedDate ? new Date(paper.PublishedDate).getFullYear() : 'n.d.';
    const citation = `${authors} (${year}). ${paper.Title}.${paper.Link ? ` ${paper.Link}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCiteCopied(true);
    setTimeout(() => setCiteCopied(false), 1500);
  };

  const tabs = [
    { id: 'abstract', label: 'Read', icon: BookOpen },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'chat', label: 'Ask AI', icon: MessageCircle },
  ];

  const year = paper.PublishedDate ? new Date(paper.PublishedDate).getFullYear() : null;
  const authors =
    paper.Authors && paper.Authors.length > 0
      ? paper.Authors.length > 4
        ? `${paper.Authors.slice(0, 4).join(', ')} +${paper.Authors.length - 4}`
        : paper.Authors.join(', ')
      : 'Unknown authors';

  return (
    <div className="flex h-full flex-col content-update">
      {/* Header */}
      <div className="border-b border-white/8 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-space-300/90">
            Publication
          </p>
          <div className="flex items-center gap-1.5">
            <button
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Copy citation"
              aria-label="Copy citation"
              onClick={handleCopyCitation}
            >
              {citeCopied ? <Check className="h-4 w-4 text-cosmic-300" /> : <Quote className="h-4 w-4" />}
            </button>
            <button
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
              title={paper.Link ? 'Copy article link' : 'No link available'}
              aria-label="Copy article link"
              onClick={handleCopyUrl}
              disabled={!paper.Link}
            >
              {copied ? <Check className="h-4 w-4 text-cosmic-300" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
              title={paper.Link ? 'Open article' : 'No link available'}
              aria-label="Open article in new tab"
              onClick={() => paper.Link && window.open(paper.Link, '_blank', 'noopener,noreferrer')}
              disabled={!paper.Link}
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="text-lg font-semibold leading-snug text-white">{paper.Title}</h1>

        <div className="mt-3 space-y-1.5 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <span className="text-[13px] leading-relaxed">{authors}</span>
          </div>
          {year && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="text-[13px]">{year}</span>
            </div>
          )}
        </div>

        {paper.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {paper.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md border border-cosmic-500/25 bg-cosmic-500/10 px-2 py-0.5 text-[10px] font-medium text-cosmic-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Explore this article's entity graph */}
        {onExploreArticle && (
          <button
            onClick={() => onExploreArticle(paper)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-space-500/40 bg-space-500/10 px-4 py-2.5 text-sm font-medium text-space-200 transition-colors hover:bg-space-500/20"
          >
            <Network className="h-4 w-4" />
            Explore article graph
          </button>
        )}

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl bg-white/[0.04] p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-space-500 to-cosmic-500 text-white shadow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeTab === 'abstract' && (
          <div className="space-y-3 content-update">
            {hasText(paper.Abstract) && <CollapsibleSection title="Abstract" text={paper.Abstract} />}
            {hasText(paper['Results and Discussion']) && (
              <CollapsibleSection
                title="Results & Discussion"
                text={paper['Results and Discussion']}
              />
            )}
            {hasText(paper.Conclusions) && (
              <CollapsibleSection title="Conclusions" text={paper.Conclusions} />
            )}
            {!hasText(paper.Abstract) &&
              !hasText(paper['Results and Discussion']) &&
              !hasText(paper.Conclusions) && (
                <p className="px-1 py-8 text-center text-sm text-slate-500">
                  No full text available for this publication.
                </p>
              )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="content-update">
            <div className="glass-effect rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-space-300/90">
                  AI Summary
                </h3>
                <button
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingSummary}
                  className="space-button text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {aiSummary ? 'Regenerate' : 'Generate'}
                    </>
                  )}
                </button>
              </div>
              <div className="min-h-[180px] rounded-lg border border-white/8 bg-white/[0.02] p-4">
                {aiSummary ? (
                  <p className="text-sm leading-relaxed text-slate-300">{aiSummary}</p>
                ) : (
                  <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
                    <Sparkles className="mb-3 h-8 w-8 text-slate-600" />
                    <p className="text-sm text-slate-400">No summary yet</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      Generate a concise, AI-written overview of this paper's key findings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-full flex-col content-update">
            <div
              ref={chatContainerRef}
              className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <MessageCircle className="mb-3 h-9 w-9 text-slate-600" />
                  <p className="text-sm text-slate-300">Ask about this paper</p>
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    <p>“What are the main findings?”</p>
                    <p>“How does microgravity affect the results?”</p>
                    <p>“What are the implications for space missions?”</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.type === 'user'
                          ? 'rounded-br-sm bg-space-600 text-white'
                          : message.type === 'error'
                          ? 'border border-red-500/30 bg-red-500/10 text-red-200'
                          : 'rounded-bl-sm border border-white/8 bg-white/[0.04] text-slate-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}

              {isAskingAI && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.04] px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-space-400" />
                    <span className="text-sm text-slate-400">Thinking…</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAskAI} className="mt-3 flex gap-2">
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask a question…"
                className="search-glow flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500"
                disabled={isAskingAI}
              />
              <button
                type="submit"
                disabled={!currentQuestion.trim() || isAskingAI}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-space-600 text-white transition-colors hover:bg-space-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperDetails;
