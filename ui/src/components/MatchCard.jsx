import React from "react";

export function MatchCard({ match }) {
  const similarityPercent = Math.round((match.similarity || 0) * 100);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 hover:border-green-400/60 hover:shadow-[0_0_18px_rgba(0,255,136,0.3)] transition">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono text-slate-400">
          {match.date || "Unknown date"}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">similarity</span>
          <span className="text-sm font-mono text-green-300">{similarityPercent}%</span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all"
          style={{ width: `${similarityPercent}%` }}
        />
      </div>
      <div className="text-xs text-slate-300">
        <span className="font-semibold text-slate-100">Fix: </span>
        {match.fix}
      </div>
    </div>
  );
}

