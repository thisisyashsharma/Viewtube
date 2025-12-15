// /mnt/data/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Dashboard.jsx
 * - Different layout vs VideoStudio (compact tiles + vertical activity feed).
 * - Minimal text.
 * - Permanent shimmer overlay.
 *
 * Save as: /mnt/data/Dashboard.jsx
 */

function Shimmer() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none shimmer-only-here" />
      <style>
        {`.shimmer-only-here {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.65) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer-only-here-kf 1s infinite linear;
        }
        @keyframes shimmer-only-here-kf {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`}
      </style>
    </>
  );
}

function Tile({ icon, label }) {
  return (
    <div className="relative bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 overflow-hidden ">
      <Shimmer />
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">—</div>
      </div>
    </div>
  );
}

function MiniChart() {
  return (
    <div className="relative bg-white border border-gray-100 rounded-lg p-3 overflow-hidden">
      <Shimmer />
      <div className="h-20 flex items-center justify-center bg-gray-100 rounded">
        <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 16h2v4H3zM8 10h2v10H8zM13 6h2v14h-2zM18 12h2v8h-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function ActivityItem() {
  return (
    <div className="relative bg-white border border-gray-100 rounded-lg p-3 flex items-start gap-3 overflow-hidden">
      <Shimmer />
      <div className="w-10 h-10 bg-gray-100 rounded-md" />
      <div className="flex-1">
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
        <div className="h-2 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="text-xs text-gray-400">—</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/mnt/data/VideoStudio.jsx" className="text-sm text-blue-600 hover:underline">Open Studio</Link>
            <button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">New</button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: compact tiles + charts */}
          <section className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Views" />
              <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Watch time" />
              <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M12 5v14" stroke="currentColor" strokeWidth="1.5"/><path d="M5 12h14" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Subs" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MiniChart />
              </div>
              <div className="relative">
                <MiniChart />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-800">Latest</h2>
                <div className="text-xs text-gray-500">—</div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="relative overflow-hidden">
                    <Shimmer />
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 bg-gray-100 rounded-sm" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-100 rounded w-3/5 mb-2" />
                        <div className="h-2 bg-gray-100 rounded w-2/5" />
                      </div>
                      <div className="text-xs text-gray-400">—</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right: vertical activity feed */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Activity</h3>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <ActivityItem key={i} />)}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative bg-gray-100 rounded-lg h-10 overflow-hidden">
                  <Shimmer />
                </div>
                <div className="relative bg-gray-100 rounded-lg h-10 overflow-hidden">
                  <Shimmer />
                </div>
                <div className="relative bg-gray-100 rounded-lg h-10 overflow-hidden">
                  <Shimmer />
                </div>
                <div className="relative bg-gray-100 rounded-lg h-10 overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-8 text-sm text-gray-500 text-center">
          Permanent shimmer — no data.
        </footer>
      </div>
    </div>
  );
}
