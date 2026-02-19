import React, { useEffect, useMemo, useState } from "react";
import { fetchMemory } from "../api";

export function MemoryTab() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMemory();
        setEntries(data || []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const errorTypes = useMemo(
    () => ["all", ...Array.from(new Set(entries.map((e) => e.error_type).filter(Boolean)))],
    [entries]
  );

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (typeFilter !== "all" && e.error_type !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (e.error_message || "").toLowerCase().includes(q) ||
        (e.fix || "").toLowerCase().includes(q)
      );
    });
  }, [entries, search, typeFilter]);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-2 md:space-y-0">
        <input
          type="text"
          placeholder="Search errors or fixes..."
          className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-green-400/70"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-48 bg-slate-950/70 border border-slate-700/80 rounded-md px-2 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {errorTypes.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All error types" : t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading memory...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">No entries match your filters.</div>
      ) : (
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2 text-left font-mono text-slate-400">Type</th>
                <th className="px-3 py-2 text-left font-mono text-slate-400">Message</th>
                <th className="px-3 py-2 text-left font-mono text-slate-400">Fix</th>
                <th className="px-3 py-2 text-left font-mono text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-800/80 hover:bg-slate-900/70 transition"
                >
                  <td className="px-3 py-2 text-slate-200 font-mono">
                    {e.error_type || "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {(e.error_message || "").slice(0, 80)}
                    {e.error_message && e.error_message.length > 80 ? "…" : ""}
                  </td>
                  <td className="px-3 py-2 text-slate-400">
                    {(e.fix || "").slice(0, 80)}
                    {e.fix && e.fix.length > 80 ? "…" : ""}
                  </td>
                  <td className="px-3 py-2 text-slate-400 font-mono">
                    {e.date ? e.date.slice(0, 10) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

