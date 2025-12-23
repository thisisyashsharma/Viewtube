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
    <div className="relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm overflow-hidden">
      <ShimmerOverlay />
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{subtitle}</div>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[220px] overflow-hidden">
      <ShimmerOverlay />
      <div className="h-56 w-full bg-gray-100 rounded-md flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M7 12v6M11 8v10M15 4v14M19 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

function VideoRowPlaceholder() {
  return (
    <tr className="relative bg-white border-b border-gray-100 ">
      <td className="px-4 py-3">
        <div className="relative w-32 h-18 rounded-md overflow-hidden bg-gray-100">
          <ShimmerOverlay />
        </div>
      </td>
      <td className="px-4 py-3 w-full">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-4 bg-gray-100 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/5" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-3 bg-gray-100 rounded w-20" />
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="relative">
          <ShimmerOverlay />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </td>
    </tr>
  );
}

export default function VideoStudio() {
  // This page intentionally never "loads" real data — it's a permanent shimmer.
  return (
    <div className="min-h-screen bg-gray-50 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Studio</h1>
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                 Video Management
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Link to="/help" className="text-sm text-blue-600 hover:underline">Help</Link>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Main analytics */}
          <section className="lg:col-span-9 space-y-6">
            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Views " value="—" subtitle="Loading..." />
              <MetricCard title="Watch Time" value="—" subtitle="Loading..." />
              <MetricCard title="Subscribers" value="—" subtitle="Loading..." />
              <MetricCard title="Videos" value="—" subtitle="Loading..." />
            </div>

            {/* Chart */}
            <ChartPlaceholder />

            {/* Table: Recent uploads */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Recent uploads</h2>
                <div className="text-sm text-gray-500"> loading...</div>
              </div>

              <div className="overflow-hidden rounded-md border border-gray-100">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Thumbnail</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Title</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Views</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
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
            <div className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-hidden">
              <ShimmerOverlay />
              <h3 className="text-sm font-semibold text-gray-800"></h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-md" />
                  <div className="w-full">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-md" />
                  <div className="w-full">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-hidden">
              <ShimmerOverlay />
              <h3 className="text-sm font-semibold text-gray-800">Audience</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            </div>

            <div className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-hidden">
              <ShimmerOverlay />
              <h3 className="text-sm font-semibold text-gray-800">Tips</h3>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-4/6" />
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-8 text-sm text-gray-500">
 
        </footer>
      </div>
    </div>
  );
}
