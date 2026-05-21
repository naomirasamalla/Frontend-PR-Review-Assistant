import React, { useState, useEffect } from "react";
import {
  Code2,
  Sparkles,
  Accessibility,
  CheckCircle,
  Clock,
  Trash2,
  Copy,
  Check,
  Terminal,
  Sun,
  Moon,
  RotateCcw,
  BookOpen,
  Zap,
  MousePointerClick,
  CheckSquare,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CODE_TEMPLATES, CodeTemplate } from "./data/templates";
import CodeCompare from "./components/CodeCompare";
import { PRReviewData, PastReview } from "./types";

export default function App() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("React / TSX");
  const [context, setContext] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Active review result
  const [review, setReview] = useState<PRReviewData | null>(null);
  const [originalCodeUsed, setOriginalCodeUsed] = useState<string>("");
  const [originalLanguageUsed, setOriginalLanguageUsed] = useState<string>("");

  // History state
  const [history, setHistory] = useState<PastReview[]>([]);

  // Theme state: light or dark
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Copy status indicators
  const [copiedReviewText, setCopiedReviewText] = useState<boolean>(false);

  // Loading animation simulation steps
  const steps = [
    "Analyzing React hooks composition path...",
    "Inspecting function dependencies & scopes...",
    "Scanning code architecture & parameters...",
    "Verifying styling layout & UI configurations...",
    "Checking accessibility & labeling compliance..."
  ];

  // Map of categories and icon representations
  const reviewCategories = [
    {
      key: "reactBestPractices" as const,
      label: "React Best Practices",
      icon: <Code2 className="w-4 h-4 text-blue-600" />,
      description: "Hook usage, state patterns, and clean component architecture."
    },
    {
      key: "maintainability" as const,
      label: "Maintainability Check",
      icon: <Shield className="w-4 h-4 text-teal-600" />,
      description: "Naming variables, logical complexity, and general code hygiene."
    },
    {
      key: "reusability" as const,
      label: "Reusability & Props",
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      description: "Parameterization, flexible prop design, and avoiding hardcoded items."
    },
    {
      key: "performanceNotes" as const,
      label: "Performance Notes",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      description: "Stale event listeners, unnecessary render loops, or heavy layout depth."
    },
    {
      key: "uiUxSuggestions" as const,
      label: "UI/UX Suggestions",
      icon: <MousePointerClick className="w-4 h-4 text-pink-500" />,
      description: "Visual feedback transitions, interactive layouts, and spacing consistency."
    },
    {
      key: "accessibilityNotes" as const,
      label: "Accessibility (A11y)",
      icon: <Accessibility className="w-4 h-4 text-purple-600" />,
      description: "Semantic standards, ARIA properties, and screen-readable landmarks."
    }
  ];

  // Initialize from client-side settings
  useEffect(() => {
    const saved = localStorage.getItem("frontend_pr_reviews");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to restore history", e);
      }
    }

    // Default template loaded
    if (CODE_TEMPLATES.length > 0) {
      loadTemplate(CODE_TEMPLATES[0]);
    }

    // Default theme based on preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const saveHistory = (updated: PastReview[]) => {
    setHistory(updated);
    localStorage.setItem("frontend_pr_reviews", JSON.stringify(updated));
  };

  const loadTemplate = (tpl: CodeTemplate) => {
    setCode(tpl.code);
    setLanguage(tpl.language);
    setContext(tpl.context);
    setError(null);
  };

  const clearInputs = () => {
    setCode("");
    setContext("");
    setError(null);
  };

  const runReview = async () => {
    if (!code.trim()) {
      setError("Please paste a frontend snippet to review.");
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setLoadingStep(steps[stepIdx]);
      }
    }, 1100);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, context }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Review request failed verification.");
      }

      const reviewData: PRReviewData = data.review;
      setReview(reviewData);
      setOriginalCodeUsed(code);
      setOriginalLanguageUsed(language);

      const newPastReview: PastReview = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: context.trim() ? (context.length > 30 ? context.substring(0, 30) + "..." : context) : `Review snippet (${language})`,
        code,
        language,
        context,
        review: reviewData,
      };

      const updatedHistory = [newPastReview, ...history].slice(0, 15);
      saveHistory(updatedHistory);

    } catch (err: any) {
      console.error("Review request failed: ", err);
      setError(err.message || "An error occurred with the AI assistant. Ensure API credentials are correctly saved in settings.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const loadHistoryItem = (item: PastReview) => {
    setCode(item.code);
    setLanguage(item.language);
    setContext(item.context || "");
    setReview(item.review);
    setOriginalCodeUsed(item.code);
    setOriginalLanguageUsed(item.language);
    setError(null);

    const resultsEl = document.getElementById("results-root");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter(h => h.id !== id);
    saveHistory(filtered);
  };

  const clearAllHistory = () => {
    if (confirm("Clear local review index?")) {
      saveHistory([]);
    }
  };

  const copyFullMarkdownReport = async () => {
    if (!review) return;

    let contentStr = `# Code Review feedback - ${originalLanguageUsed}\n`;
    if (context) contentStr += `Context: ${context}\n`;
    contentStr += `\n## Summary\n${review.summary}\n\n`;

    reviewCategories.forEach((cat) => {
      const items = review[cat.key];
      contentStr += `## ${cat.label}\n`;
      if (items && items.length > 0) {
        items.forEach((item) => {
          contentStr += `- **${item.title}**: ${item.explanation}${item.lineReference ? ` (_Referenced: ${item.lineReference}_)` : ""}\n`;
        });
      } else {
        contentStr += `- Core compliance standard met in this section.\n`;
      }
      contentStr += `\n`;
    });

    contentStr += `## Refactored Implementation Changes:\n${review.improvementExplanation}\n`;

    try {
      await navigator.clipboard.writeText(contentStr);
      setCopiedReviewText(true);
      setTimeout(() => setCopiedReviewText(false), 2000);
    } catch (err) {
      console.error("Copy failed: ", err);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#F4F4F7] text-slate-800"
      }`}
    >
      {/* Header Bar */}
      <header
        className={`h-16 px-6 lg:px-12 flex items-center justify-between border-b shrink-0 transition-all ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              PR Sentinel
            </span>
            <span className="text-xs text-blue-600 font-semibold font-mono">v1.2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden md:inline text-xs text-slate-400 font-medium">
            AI-Assisted Frontend Reviewer
          </span>

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`p-2 rounded-lg border transition ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-slate-350 hover:text-white"
                : "bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-900"
            }`}
            title="Toggle theme visual display"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Input Parameters panel (Left Column) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Section banner */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Source Input Snippet
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Gemma AI Engine</span>
          </div>

          {/* Quick-select Snippet Toolbar */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 shadow-sm ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Diagnostic Sandbox Scenarios</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              {CODE_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => loadTemplate(tpl)}
                  className={`text-[11.5px] p-2 rounded-lg border text-left font-medium transition flex items-start gap-2 cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800/80 hover:bg-slate-800 text-slate-300"
                      : "bg-[#F8F9FA] border-gray-150 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="text-blue-500 mt-0.5">•</span>
                  <div>
                    <span className="font-bold underline decoration-blue-500/30">{tpl.name}</span>
                    <p className="text-[10px] text-slate-450 mt-0.5 font-normal leading-tight line-clamp-1">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input details config card */}
          <div
            className={`flex-1 rounded-xl border p-5 flex flex-col gap-4 shadow-sm ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
            }`}
          >
            {/* Options grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Snippet Format</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-250"
                      : "bg-[#F8F9FA] border-gray-200 text-slate-700"
                  }`}
                >
                  <option value="React / TSX">React / TSX</option>
                  <option value="HTML / CSS">HTML / CSS</option>
                  <option value="Vue / Vue3 SFC">Vue SFC</option>
                  <option value="Modern JavaScript">Vanilla Javascript</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Functional Intent</label>
                <input
                  type="text"
                  placeholder="e.g. Navigation bar menu, badge count"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className={`w-full p-2 text-xs rounded-lg border outline-none font-medium ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-250"
                      : "bg-[#F8F9FA] border-gray-200 text-slate-700"
                  }`}
                />
              </div>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 flex flex-col">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 shrink-0">Pasted Source Code</label>
              <div className="relative flex-1 flex flex-col">
                <textarea
                  id="source-code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your component block or raw HTML snippet copy here..."
                  className={`w-full flex-1 p-3.5 font-mono text-xs rounded-xl border resize-none outline-none leading-relaxed ${
                    theme === "dark"
                      ? "bg-slate-950 border-slate-800 text-slate-150 placeholder-slate-700"
                      : "bg-[#FAFAFB] border-gray-200 text-slate-800 placeholder-slate-400"
                  }`}
                />

                <div className="absolute right-3.5 bottom-2.5 text-[10px] text-slate-450 font-mono">
                  {code.split("\n").length} L | {code.length} C
                </div>
              </div>
            </div>

            {/* Submit Trigger - Clean Blue Theme */}
            <button
              id="trigger-review-action"
              onClick={runReview}
              disabled={loading}
              className={`w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold">Running Quality Scan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">Review Code Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Past Run history tracker */}
          {history.length > 0 && (
            <div
              className={`p-4 rounded-xl border flex flex-col gap-2.5 shadow-sm ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-200/40 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Review History ({history.length})</span>
                </span>
                <button
                  onClick={clearAllHistory}
                  className="text-[10px] text-slate-450 hover:text-rose-500 font-semibold transition"
                >
                  Clear history
                </button>
              </div>

              <div className="max-h-[120px] overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => loadHistoryItem(h)}
                    className="w-full text-left p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-950 flex items-center justify-between text-[11.5px] transition cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {h.title}
                      </p>
                      <span className="text-[9.5px] text-slate-400 font-mono">
                        {h.timestamp} &bull; {h.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => removeHistoryItem(h.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* AI Output Workspace Panel (Right Column) */}
        <section className="lg:col-span-7 flex flex-col gap-4 overflow-hidden" id="results-root">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PR Quality Review Report
            </h2>

            {review && (
              <button
                id="copy-markdown-report-btn"
                onClick={copyFullMarkdownReport}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer transition select-none"
              >
                {copiedReviewText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Feedback Markdown Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Copy Full Markdown Feedback</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-[450px] pr-1">
            
            {/* Idle Welcome View */}
            {!loading && !review && !error && (
              <div
                className={`p-10 rounded-2xl border text-center my-auto flex flex-col items-center justify-center gap-4 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-950 text-blue-600 rounded-xl flex items-center justify-center border border-gray-100 dark:border-slate-800">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Idle Review Console</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                    Choose one of the presets on the left or paste your custom React, HTML, or Vue source code to trigger a code audit.
                  </p>
                </div>
                
                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-full border border-gray-200/50 dark:border-slate-800/80 text-[10px] text-slate-450 font-medium font-mono">
                  Analyzes hooks execution, logic consistency, styling & UI structures.
                </div>
              </div>
            )}

            {/* Processing State View */}
            {loading && (
              <div
                className={`p-10 rounded-2xl border my-auto flex flex-col items-center justify-center gap-6 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-600/10 border-t-blue-600 animate-spin"></div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    Inspecting Code Quality
                  </h4>
                  <p className="text-[11.5px] text-slate-450 animate-pulse font-mono block">
                    {loadingStep || "Consulting local compiler suggestions..."}
                  </p>
                </div>

                {/* Loading process checklist */}
                <div className="w-full max-w-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-150 dark:border-slate-800 space-y-2 text-left">
                  {steps.map((st, i) => {
                    const selfI = steps.indexOf(loadingStep);
                    const isDone = selfI > i;
                    const isCurrent = selfI === i;

                    return (
                      <div key={i} className="flex items-center gap-2 text-[10.5px]">
                        {isDone ? (
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                            ✓
                          </div>
                        ) : isCurrent ? (
                          <div className="w-3.5 h-3.5 rounded-full border border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                        )}
                        <span
                          className={`font-medium ${
                            isDone ? "text-blue-600 line-through opacity-80" : isCurrent ? "text-slate-800 dark:text-slate-200 font-bold" : "text-slate-400"
                          }`}
                        >
                          {st.split("...")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Container */}
            {error && (
              <div className="p-5 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-150 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 flex flex-col gap-3">
                <p className="text-xs font-semibold leading-relaxed">
                  {error}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={runReview}
                    className="px-3 py-1.5 bg-blue-600 active:bg-blue-700 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Complete Refined Review Results output */}
            {review && !loading && !error && (
              <div className="space-y-5">
                
                {/* Executive Summary Card - Clean Minimalism Style */}
                <div
                  className={`p-6 rounded-xl border shadow-sm transition-colors ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-2 font-mono">Executive Summary</p>
                  <p className="text-xs md:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {review.summary}
                  </p>
                </div>

                {/* Diff Segment Comparison card */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      🔬 Diff Solution comparison
                    </span>
                  </div>

                  <CodeCompare 
                    originalCode={originalCodeUsed}
                    improvedCode={review.improvedCode}
                    language={originalLanguageUsed}
                  />
                </div>

                {/* Categories Grid - Clean, light visual border blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewCategories.map((cat, idx) => {
                    const points = review[cat.key];
                    const hasPoints = points && points.length > 0;

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border shadow-sm ${
                          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200/40 dark:border-slate-800 pb-2">
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-950">{cat.icon}</span>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                              {cat.label}
                            </h3>
                          </div>
                        </div>

                        {hasPoints ? (
                          <ul className="space-y-3.5">
                            {points.map((pt, i) => (
                              <li key={i} className="text-xs leading-relaxed">
                                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-start gap-1">
                                  <span>&mdash;</span>
                                  <span>{pt.title}</span>
                                  {pt.lineReference && (
                                    <span className="ml-auto text-[9px] font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-slate-450 border border-slate-200/50 dark:border-slate-800">
                                      {pt.lineReference}
                                    </span>
                                  )}
                                </span>
                                <p className="text-slate-650 dark:text-slate-400 mt-1 pl-3.5 text-[11px] leading-relaxed">
                                  {pt.explanation}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Core conformance is clean in this section.</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Improvements rationale overview list bubble */}
                {review.improvementExplanation && (
                  <div className="bg-blue-600 p-5 rounded-xl shadow-md text-white">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                      Refactoring Rationale
                    </h3>
                    <div className="text-xs opacity-95 leading-relaxed font-medium whitespace-pre-wrap">
                      {review.improvementExplanation}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </section>

      </main>

      {/* Footer minimal status bar */}
      <footer
        className={`h-11 border-t px-6 lg:px-12 flex items-center justify-between text-[10px] shrink-0 font-medium transition-colors ${
          theme === "dark" ? "bg-slate-900 border-slate-850 text-slate-500" : "bg-white border-gray-200 text-slate-400"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Gemma Core Refactoring Sandbox Active
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Review Latency: ~510ms</span>
        </div>

        <div>
          © 2026 PR Sentinel — Minimalist Frontend IQ
        </div>
      </footer>
    </div>
  );
}
