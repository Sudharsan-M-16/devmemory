import React, { useState } from "react";
import { queryError, learnError } from "../api";
import { MatchCard } from "./MatchCard";

export function QueryTab({ onStoreSuccess }) {
  const [errorText, setErrorText] = useState(
    `Traceback (most recent call last):
  File "app.py", line 23, in <module>
    user_id = request.user.id
AttributeError: 'NoneType' object has no attribute 'id'`
  );
  const [loading, setLoading] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);
  const [matches, setMatches] = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [storeFix, setStoreFix] = useState("");
  const [storeLoading, setStoreLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    try {
      const res = await queryError(errorText);
      setFingerprint(res.fingerprint);
      setMatches(res.matches || []);
      setSuggestion(res.suggestion || "");
    } catch (e) {
      setError(e.message || "Failed to query DevMemory");
    } finally {
      setLoading(false);
    }
  }

  async function handleStore() {
    if (!storeFix.trim()) return;
    setStoreLoading(true);
    try {
      await learnError(errorText, storeFix);
      setStoreFix("");
      onStoreSuccess?.();
    } catch (e) {
      setError(e.message || "Failed to store fix");
    } finally {
      setStoreLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-1">
          Error / Traceback
        </label>
        <textarea
          className="w-full h-48 bg-slate-950/70 border border-slate-700/80 rounded-lg p-3 text-sm font-mono text-slate-100 outline-none focus:border-green-400/70 focus:shadow-[0_0_18px_rgba(0,255,136,0.3)] transition"
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
        />
      </div>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 rounded-md bg-green-500 text-black text-sm font-semibold hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_0_18px_rgba(0,255,136,0.35)]"
      >
        {loading ? "Analyzing..." : "Analyze Error"}
      </button>
      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {fingerprint && (
        <div className="border border-slate-700 rounded-lg p-3 bg-slate-950/60">
          <div className="text-xs text-slate-400 font-mono mb-1">Parsed error</div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/50 text-[11px] font-mono text-green-200">
            {fingerprint.error_type}
          </span>
          <div className="mt-1 text-xs text-slate-300">
            {fingerprint.error_message}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <div className="text-xs font-mono text-slate-400 mb-2">
            Similar past errors
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.map((m, i) => (
              <MatchCard key={i} match={m} />
            ))}
          </div>
        </div>
      )}

      {suggestion && (
        <div className="border border-cyan-400/60 rounded-lg bg-slate-950/70 p-4 shadow-[0_0_25px_rgba(0,217,255,0.2)]">
          <div className="text-xs font-mono text-cyan-300 mb-1">
            DevMemory suggestion
          </div>
          <div className="text-sm text-slate-100 whitespace-pre-wrap">{suggestion}</div>
        </div>
      )}

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <div className="text-xs font-mono text-slate-400">
          Store this fix for next time
        </div>
        <textarea
          className="w-full h-24 bg-slate-950/70 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 outline-none focus:border-green-400/70"
          placeholder="Describe how you fixed this error..."
          value={storeFix}
          onChange={(e) => setStoreFix(e.target.value)}
        />
        <button
          onClick={handleStore}
          disabled={storeLoading || !storeFix.trim()}
          className="inline-flex items-center px-3 py-1.5 rounded-md bg-cyan-500 text-black text-xs font-semibold hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {storeLoading ? "Saving..." : "Store this fix"}
        </button>
      </div>
    </div>
  );
}

