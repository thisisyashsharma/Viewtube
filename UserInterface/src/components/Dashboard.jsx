import React from "react";
import { Link } from "react-router-dom";
import { LineDrawIcon } from "./common";

/**
 * Dashboard.jsx
 * - Different layout vs VideoStudio (compact tiles + vertical activity feed).
 * - Minimal text.
 * - Permanent shimmer overlay.
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

function Tile({ path, label }) {
  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4 overflow-hidden transition-colors duration-200 group hover:border-gray-300 dark:hover:border-gray-700">
      <Shimmer />
      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <LineDrawIcon
          path={path}
          className="w-6 h-6"
          baseColor="text-gray-500 dark:text-gray-400"
          activeColor="text-gray-900 dark:text-gray-100"
          strokeWidth={1.75}
        />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">—</div>
      </div>
    </div>
  );
}

function MiniChart() {
  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-gray-800 rounded-lg p-3 overflow-hidden transition-colors duration-200">
      <Shimmer />
      <div className="h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
        <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 16h2v4H3zM8 10h2v10H8zM13 6h2v14h-2zM18 12h2v8h-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function ActivityItem() {
  return (
    <div className="relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-gray-800 rounded-lg p-3 flex items-start gap-3 overflow-hidden transition-colors duration-200">
      <Shimmer />
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md" />
      <div className="flex-1">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">—</div>
    </div>
  );
}

import PageContainer from "./layout/PageContainer";

export default function Dashboard() {
  return (
    <PageContainer>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Channel overview and analytics</p>
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
            <Tile path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" label="Views" />
            <Tile path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Watch time" />
            <Tile path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Subscribers" />
            <Tile path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" label="Revenue" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-64 sm:h-80">
              <MiniChart />
            </div>
            <div className="relative h-64 sm:h-80">
              <MiniChart />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Latest Content</h2>
            </div>

            <div className="overflow-x-auto">
              <div className="space-y-3 min-w-[500px]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative overflow-hidden p-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between">
                    <Shimmer />
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
                      <div>
                        <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-44 mb-1.5" />
                        <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Published</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: vertical activity feed */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <ActivityItem key={i} />)}
            </div>
          </div>
        </aside>
      </main>
    </PageContainer>
  );
}

