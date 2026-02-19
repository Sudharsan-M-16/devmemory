import React from "react";

export function MetricCard({ label, value, subtitle, accent = "green" }) {
  const accentColor =
    accent === "cyan"
      ? "from-cyan-500/40 to-cyan-400/20 border-cyan-400/60"
      : "from-green-500/40 to-green-400/20 border-green-400/60";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${accentColor} bg-gradient-to-br p-4 shadow-[0_0_25px_rgba(0,255,136,0.15)]`}
    >
      <div className="text-xs font-mono text-slate-300 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl font-semibold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent)]" />
    </div>
  );
}

