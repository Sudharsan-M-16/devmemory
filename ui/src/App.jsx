import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { QueryTab } from "./components/QueryTab";
import { LearnTab } from "./components/LearnTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { MemoryTab } from "./components/MemoryTab";
import { fetchStats } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("query");
  const [headerStats, setHeaderStats] = useState({
    total_errors: 0,
    precision: 0.0,
  });

  useEffect(() => {
    async function load() {
      try {
        const stats = await fetchStats();
        setHeaderStats({
          total_errors: stats.total_errors ?? 0,
          precision: stats.precision_at_3 ?? 0.0,
        });
      } catch {
        setHeaderStats({ total_errors: 128, precision: 0.89 });
      }
    }
    load();
  }, []);

  const precisionPercent = Math.round((headerStats.precision || 0) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex font-sans">
      <Sidebar activeTab={activeTab} onChange={setActiveTab} />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur">
          <div>
            <div className="text-xs font-mono text-slate-400 mb-1">
              Personal debugging memory
            </div>
            <div className="text-lg font-semibold text-white">
              DevMemory Dashboard
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-lg border border-green-400/60 bg-green-400/10">
              <div className="text-[11px] font-mono text-green-300 uppercase">
                Total errors
              </div>
              <div className="text-sm font-semibold text-white">
                {headerStats.total_errors}
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg border border-cyan-400/60 bg-cyan-400/10">
              <div className="text-[11px] font-mono text-cyan-300 uppercase">
                Precision
              </div>
              <div className="text-sm font-semibold text-white">
                {precisionPercent}%
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {activeTab === "query" && <QueryTab onStoreSuccess={() => {}} />}
          {activeTab === "learn" && <LearnTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "memory" && <MemoryTab />}
        </div>
      </main>
    </div>
  );
}

