import { useState } from "react";
import { Copy, Check, Download, FileCode } from "lucide-react";

interface CodeCompareProps {
  originalCode: string;
  improvedCode: string;
  language: string;
}

export default function CodeCompare({ originalCode, improvedCode, language }: CodeCompareProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);
  const [compareMode, setCompareMode] = useState<"split" | "original" | "improved">("split");

  const copyToClipboard = async (text: string, setCopiedState: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="code-compare-pane">
      {/* Header bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium text-xs font-mono uppercase tracking-wider">{language || "Detected Language"}</span>
        </div>

        {/* Action controls */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            id="tab-split-mode"
            onClick={() => setCompareMode("split")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              compareMode === "split" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Side-by-Side
          </button>
          <button
            id="tab-original-mode"
            onClick={() => setCompareMode("original")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              compareMode === "original" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Original Only
          </button>
          <button
            id="tab-improved-mode"
            onClick={() => setCompareMode("improved")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              compareMode === "improved" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Improved Code
          </button>
        </div>
      </div>

      {/* Code contents block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-slate-800">
        {/* Original file column */}
        {(compareMode === "split" || compareMode === "original") && (
          <div className={`${compareMode === "split" ? "md:col-span-6" : "md:col-span-12"} bg-slate-900 flex flex-col`}>
            {/* Header label */}
            <div className="bg-slate-950/40 px-4 py-2 text-xs font-mono font-semibold text-slate-400 flex items-center justify-between border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Original Copied Code
              </span>

              <button
                id="copy-original-btn"
                onClick={() => copyToClipboard(originalCode, setCopiedOriginal)}
                className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-sans text-xs"
                title="Copy Original Code"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedOriginal ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Editor block space */}
            <div className="overflow-auto max-h-[480px] p-4 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre select-all leading-relaxed tab-size-2">
                <code>{originalCode || "// Empty Code"}</code>
              </pre>
            </div>
          </div>
        )}

        {/* AI refined columns */}
        {(compareMode === "split" || compareMode === "improved") && (
          <div className={`${compareMode === "split" ? "md:col-span-6" : "md:col-span-12"} bg-slate-900 flex flex-col`}>
            {/* Header label */}
            <div className="bg-slate-950/40 px-4 py-2 text-xs font-mono font-semibold text-slate-400 flex items-center justify-between border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                AI Refined Solution
              </span>

              <div className="flex gap-1.5">
                <button
                  id="download-improved-btn"
                  onClick={() => handleDownload(improvedCode, `improved-snippet.${language.toLowerCase().includes("tsx") ? "tsx" : "html"}`)}
                  className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  id="copy-improved-btn"
                  onClick={() => copyToClipboard(improvedCode, setCopiedImproved)}
                  className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-sans text-xs"
                >
                  {copiedImproved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedImproved ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Editor block space */}
            <div className="overflow-auto max-h-[480px] p-4 font-mono text-xs text-emerald-300">
              <pre className="whitespace-pre select-all leading-relaxed tab-size-2">
                <code>{improvedCode || "// Processing, please review feedback logs below"}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
