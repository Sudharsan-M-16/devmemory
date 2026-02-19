import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";
import { MetricCard } from "./MetricCard";
import {
  ErrorTypeBarChart,
  ErrorTimelineChart,
  SimilarityHistogram,
} from "./ErrorChart";

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch {
        // Fallback example data until backend is wired
        setStats({
          total_errors: 128,
          avg_similarity: 0.78,
          most_common_type: "AttributeError",
          this_week_count: 14,
          error_type_counts: [
            { type: "AttributeError", count: 32 },
            { type: "TypeError", count: 24 },
            { type: "ValueError", count: 18 },
            { type: "ImportError", count: 9 },
            { type: "KeyError", count: 7 },
          ],
          recent_errors: [
            { date: "2025-02-10", count: 3 },
            { date: "2025-02-11", count: 4 },
            { date: "2025-02-12", count: 2 },
            { date: "2025-02-13", count: 5 },
            { date: "2025-02-14", count: 3 },
          ],
          similarity_distribution: [
            { bucket: "0.4–0.5", count: 4 },
            { bucket: "0.5–0.6", count: 10 },
            { bucket: "0.6–0.7", count: 18 },
            { bucket: "0.7–0.8", count: 22 },
            { bucket: "0.8–0.9", count: 11 },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading && !stats) {
    return <div className="text-sm text-slate-400">Loading analytics...</div>;
  }

  const {
    total_errors,
    avg_similarity,
    most_common_type,
    this_week_count,
    error_type_counts,
    recent_errors,
    similarity_distribution,
  } = stats || {};

  const avgSimPercent = avg_similarity ? Math.round(avg_similarity * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Errors"
          value={total_errors ?? 0}
          subtitle="All-time personal debugging history"
        />
        <MetricCard
          label="Avg Similarity"
          value={`${avgSimPercent}%`}
          subtitle="Mean match similarity"
          accent="cyan"
        />
        <MetricCard
          label="Most Common Type"
          value={most_common_type || "—"}
          subtitle="By frequency"
        />
        <MetricCard
          label="This Week"
          value={this_week_count ?? 0}
          subtitle="Errors stored in last 7 days"
          accent="cyan"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
          <div className="text-xs font-mono text-slate-400 mb-2">
            Top 10 error types
          </div>
          <ErrorTypeBarChart data={error_type_counts || []} />
        </div>
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
          <div className="text-xs font-mono text-slate-400 mb-2">
            Errors over time (last 30 days)
          </div>
          <ErrorTimelineChart data={recent_errors || []} />
        </div>
      </div>

      <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4">
        <div className="text-xs font-mono text-slate-400 mb-2">
          Similarity distribution
        </div>
        <SimilarityHistogram data={similarity_distribution || []} />
      </div>
    </div>
  );
}

