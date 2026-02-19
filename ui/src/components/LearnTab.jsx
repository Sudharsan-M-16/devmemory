import React, { useState } from "react";
import { learnError } from "../api";

export function LearnTab() {
  const [errorText, setErrorText] = useState("");
  const [fixText, setFixText] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  async function handleSubmit() {
    if (!errorText.trim() || !fixText.trim()) return;
    setLoading(true);
    setToast("");
    try {
      await learnError(errorText, fixText);
      setErrorText("");
      setFixText("");
      setToast("Stored in DevMemory ✔");
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      setToast(e.message || "Failed to add to memory");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-1">
          Error / Traceback
        </label>
        <textarea
          className="w-full h-40 bg-slate-950/70 border border-slate-700/80 rounded-lg p-3 text-sm font-mono text-slate-100 outline-none focus:border-green-400/70"
          value={errorText}
          onChange={(e) => setErrorText(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-1">
          Fix you applied
        </label>
        <textarea
          className="w-full h-32 bg-slate-950/70 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 outline-none focus:border-green-400/70"
          value={fixText}
          onChange={(e) => setFixText(e.target.value)}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !errorText.trim() || !fixText.trim()}
        className="inline-flex items-center px-4 py-2 rounded-md bg-green-500 text-black text-sm font-semibold hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-[0_0_18px_rgba(0,255,136,0.35)]"
      >
        {loading ? "Adding..." : "Add to Memory"}
      </button>
      {toast && (
        <div className="text-xs text-green-300 bg-green-500/10 border border-green-500/40 rounded-md px-3 py-2">
          {toast}
        </div>
      )}
    </div>
  );
}

