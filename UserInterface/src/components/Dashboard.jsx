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

import PageContainer from "./layout/PageContainer";

export default function Dashboard() {
  return (
    <PageContainer>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Channel overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/video_studio" className="text-sm font-semibold text-blue-600 hover:underline">
            Open Studio
          </Link>
          <Link to="/upload_video" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Upload Video
          </Link>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: compact tiles + charts */}
        <section className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Views" />
            <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Watch time" />
            <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M12 5v14" stroke="currentColor" strokeWidth="1.5"/><path d="M5 12h14" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Subscribers" />
            <Tile icon={<svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5"/></svg>} label="Revenue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-64 sm:h-80">
              <MiniChart />
            </div>
            <div className="relative h-64 sm:h-80">
              <MiniChart />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Latest Content</h2>
            </div>

            <div className="overflow-x-auto">
              <div className="space-y-3 min-w-[500px]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative overflow-hidden p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <Shimmer />
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div>
                        <div className="h-3.5 bg-gray-200 rounded w-44 mb-1.5" />
                        <div className="h-2.5 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Published</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: vertical activity feed */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <ActivityItem key={i} />)}
            </div>
          </div>
        </aside>
      </main>
    </PageContainer>
  );
}

