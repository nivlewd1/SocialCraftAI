import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trendResearchService } from '../services/trendResearchService';
import { IconSearch, IconRefresh, IconZap } from '../components/ui/Icons';
import ReactMarkdown from 'react-markdown';
import { TrendReport, TrendAnalysisResult, TrendScoutNavigationState } from '../types';
import { fetchAgenticTrends } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Terminal, Cpu, ArrowRight, Globe, Clock, AlertCircle, CheckCircle2, Lightbulb, Info } from 'lucide-react';

interface TrendsAgentProps {
  onTrendsFound: (report: TrendReport) => void;
  onOpenAuth: () => void;
}

export const TrendsAgent: React.FC<TrendsAgentProps> = ({ onTrendsFound, onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get navigation state if coming from Generator
  const navState = location.state as TrendScoutNavigationState | null;
  
  const [niche, setNiche] = useState(navState?.initialTopic || 'Generative AI Marketing');
  const [isSearching, setIsSearching] = useState(false);
  const [currentReport, setCurrentReport] = useState<TrendReport | null>(null);
  const [quickResearchContext, setQuickResearchContext] = useState<TrendAnalysisResult | null>(
    navState?.quickResearch || null
  );

  // State for dynamic logs
  const [logs, setLogs] = useState<Array<{ msg: string, type: 'info' | 'success' | 'warning' | 'error' }>>([
    { msg: '> System Initialized', type: 'success' },
    { msg: '> Waiting for command...', type: 'info' }
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Clear navigation state after reading
  useEffect(() => {
    if (navState) {
      navigate('.', { replace: true, state: {} });
    }
  }, []);

  // Show context from quick research if available
  useEffect(() => {
    if (quickResearchContext) {
      setLogs(prev => [
        ...prev,
        { msg: '> Quick research context loaded from Generator', type: 'info' },
        { msg: `> Topic: ${niche}`, type: 'info' },
        { msg: `> Found ${quickResearchContext.identifiedTrends.length} preliminary trends`, type: 'success' },
        { msg: '> Ready for deep analysis...', type: 'warning' }
      ]);
    }
  }, [quickResearchContext]);

  // Auto-scroll logs (but not on initial mount to prevent page scroll on load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleRunAgent = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!niche) return;
    setIsSearching(true);
    // Reset logs for new run
    setLogs([
      { msg: '> System Initialized', type: 'success' },
      { msg: `> Target Niche: ${niche}`, type: 'info' },
      { msg: '> Initiating Agentic Search Loop...', type: 'warning' }
    ]);

    // If we have quick research context, add that to the logs
    if (quickResearchContext) {
      setLogs(prev => [
        ...prev,
        { msg: '> Building on quick research from Generator...', type: 'info' }
      ]);
    }

    // Simulation of intermediate steps while awaiting API
    const steps = [
      '> Connecting to Google Search Grounding...',
      '> Scanning global news sources (Last 7 Days)...',
      '> Analyzing top search results...',
      '> Filtering for high-impact viral topics...',
      '> Synthesizing insights into briefing...'
    ];

    let stepIndex = 0;
    const intervalId = setInterval(() => {
      if (stepIndex < steps.length) {
        setLogs(prev => [...prev, { msg: steps[stepIndex], type: 'warning' }]);
        stepIndex++;
      }
    }, 1500);

    try {
      const { text, sources } = await fetchAgenticTrends(niche);

      clearInterval(intervalId);
      setLogs(prev => [
        ...prev,
        { msg: '> Data received from Gemini.', type: 'success' },
        { msg: '> Formatting final report...', type: 'success' },
        { msg: '> Saving to database...', type: 'info' }
      ]);

      // Use the unified trend research service
      const report = await trendResearchService.saveDeepResearch(niche, text, sources);

      setLogs(prev => [
        ...prev,
        { msg: '> Report saved successfully.', type: 'success' }
      ]);

      setCurrentReport(report);
      onTrendsFound(report);

      // Clear the quick research context after successful deep research
      setQuickResearchContext(null);

      // Navigate to Amplifier with the report
      navigate('/amplifier', { state: { report } });

    } catch (error) {
      clearInterval(intervalId);
      console.error(error);
      setLogs(prev => [...prev, { msg: '> CRITICAL ERROR: API Request Failed.', type: 'error' }]);
      alert("Agent failed to retrieve trends. Check console.");
    } finally {
      setIsSearching(false);
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Globe className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-surface-900">
          Trend Scout <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Agent</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your autonomous research assistant. Scans the live web to find viral opportunities before they peak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        {/* Left Panel: Agent Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-lg space-y-6 border border-white/50 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-surface-900">Agent Control</h2>
            </div>

            {/* Quick Research Context Banner */}
            {quickResearchContext && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-800">Continuing from Generator</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      Found {quickResearchContext.identifiedTrends.length} preliminary trends. 
                      Run deep analysis for comprehensive insights.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {quickResearchContext.identifiedTrends.slice(0, 3).map((trend, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {trend.trendTitle.substring(0, 25)}...
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Niche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-surface-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
                    placeholder="e.g. SaaS Marketing"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Tip:</strong> Be specific! "AI for Healthcare" works better than just "AI". The agent searches live web data for trending topics in your niche.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-bold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Schedule
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Active</span>
                </div>
                <p className="text-xs text-blue-600/80 leading-relaxed">
                  Running automatically every Monday & Thursday at 09:00 AM.
                </p>
              </div>

              <button
                onClick={handleRunAgent}
                disabled={isSearching}
                className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                                ${isSearching
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/25'
                  }`}
              >
                {isSearching ? (
                  <>
                    <IconRefresh className="animate-spin w-5 h-5" /> Scanning Web...
                  </>
                ) : (
                  <>
                    <IconZap className="w-5 h-5" /> Run Agent Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Log */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-2xl flex flex-col h-[300px] font-mono text-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50"></div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
              <span className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Live Logs
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className={`${getLogColor(log.type)} flex gap-2`}>
                  <span className="opacity-50 select-none">{'>'}</span>
                  <span>{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-8 h-full">
          <div className="glass-card rounded-lg border border-white/50 shadow-xl h-full min-h-[600px] flex flex-col overflow-hidden">
            {!currentReport ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-surface-900">Ready to Scout</h3>
                  <p className="text-gray-500">
                    Enter your niche and run the agent to generate a real-time trend briefing.
                  </p>
                  {quickResearchContext && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-sm text-purple-700">
                        <Lightbulb className="w-4 h-4 inline mr-2" />
                        You have quick research data ready. Run the agent for a comprehensive deep dive!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {currentReport.date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                          Deep Research
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-surface-900">Trend Briefing: {currentReport.niche}</h3>
                    </div>
                    <button
                      onClick={() => navigate('/amplifier', { state: { report: currentReport } })}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-950 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors shadow-md"
                    >
                      Amplifier <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto flex-1 prose prose-slate max-w-none prose-headings:font-display prose-headings:text-surface-900 prose-a:text-purple-600">
                  <ReactMarkdown>{currentReport.content || ''}</ReactMarkdown>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 text-sm">
                  <span className="font-bold text-surface-900 flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-brand-primary" /> Sources Cited
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {currentReport.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm hover:shadow-md max-w-xs truncate"
                      >
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
                        <span className="truncate">{s.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
