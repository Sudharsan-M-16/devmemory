import React from "react";
import { FiActivity, FiDatabase, FiHelpCircle, FiPlusCircle } from "react-icons/fi";

const navItems = [
  { id: "query", label: "Query", icon: FiHelpCircle },
  { id: "learn", label: "Learn", icon: FiPlusCircle },
  { id: "analytics", label: "Analytics", icon: FiActivity },
  { id: "memory", label: "Memory", icon: FiDatabase },
];

export function Sidebar({ activeTab, onChange }) {
  return (
    <aside className="w-64 bg-black/95 border-r border-green-500/20 flex flex-col">
      <div className="px-6 py-5 border-b border-green-500/20">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-green-400/10 border border-green-400/60 flex items-center justify-center">
            <span className="text-green-400 font-mono text-lg">DM</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">DevMemory</div>
            <div className="text-xs text-slate-400 font-mono">debugging brain</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition
                ${
                  active
                    ? "bg-green-400/10 border border-green-400/60 text-green-200 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 font-mono">
        Terminal · AI · RAG
      </div>
    </aside>
  );
}

