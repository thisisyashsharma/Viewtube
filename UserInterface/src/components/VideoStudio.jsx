// /mnt/data/VideoStudio.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * VideoStudio.jsx
 * - Studio-like dashboard with permanent shimmer placeholders (never resolves).
 * - Responsive layout: metrics row, chart area, recent uploads table, sidebar.
 * - Uses the shimmer CSS provided by you (applied as overlay on placeholders).
 *
 * Save as: /mnt/data/VideoStudio.jsx
 */

function ShimmerOverlay() {
  return (
    <>
      {/* Temprary - Shimmer Placeholder */}
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

function MetricCard({ title, value, subtitle }) {
  return (
    <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm overflow-hidden">
      <ShimmerOverlay />
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</div>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[220px] overflow-hidden">
      <ShimmerOverlay />
      <div className="h-56 w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M7 12v6M11 8v10M15 4v14M19 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

function VideoRowPlaceholder() {
  return (
    <tr className="relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <td className="px-4 py-3">
        <div className="relative w-32 h-18 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
          <ShimmerOverlay />
        </div>
      </td>
      <td className="px-4 py-3 w-full">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/5" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
        </div>
      </td>
    </tr>
  );
}

import PageContainer from "./layout/PageContainer";

export default function VideoStudio() {
  return (
    <PageContainer>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Studio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage channel videos and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/help" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Help</Link>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Main analytics */}
        <section className="lg:col-span-9 space-y-6">
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Views" value="—" subtitle="Loading..." />
            <MetricCard title="Watch Time" value="—" subtitle="Loading..." />
            <MetricCard title="Subscribers" value="—" subtitle="Loading..." />
            <MetricCard title="Videos" value="—" subtitle="Loading..." />
          </div>

          {/* Chart */}
          <ChartPlaceholder />

          {/* Table: Recent uploads */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Recent Uploads</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <table className="w-full min-w-[640px] bg-white dark:bg-gray-900 text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Thumbnail</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <VideoRowPlaceholder key={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right column: Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm overflow-hidden">
            <ShimmerOverlay />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Channel Stats</h3>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>

          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm overflow-hidden">
            <ShimmerOverlay />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Audience</h3>
            <div className="space-y-2">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </aside>
      </main>
    </PageContainer>
  );
}

