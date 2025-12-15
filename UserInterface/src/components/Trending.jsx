// /mnt/data/Trending.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Trending.jsx
 * - Page shows ONLY shimmer placeholders (no visible text).
 * - Responsive layout with banner, grid cards, and a long list — all shimmering.
 * - Includes a visually-hidden link to the uploaded help file path: /mnt/data/Help.jsx
 *
 * Save as: /mnt/data/Trending.jsx
 */

function ShimmerLayer() {
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

function BannerPlaceholder() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gray-100">
      <ShimmerLayer />
      <div className="h-44 sm:h-60 md:h-72 lg:h-80" aria-hidden="true" />
    </div>
  );
}

function CardPlaceholder({ ratio = "16/9" }) {
  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <ShimmerLayer />
      <div className={`w-full ${ratio === "square" ? "pt-[100%]" : "aspect-w-16 aspect-h-9"}`} aria-hidden="true" />
      <div className="p-3">
        <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" aria-hidden="true" />
        <div className="h-2 bg-gray-100 rounded w-1/2" aria-hidden="true" />
      </div>
    </div>
  );
}

function RowPlaceholder() {
  return (
    <div className="relative flex items-center gap-4 py-3 border-b border-gray-100">
      <ShimmerLayer />
      <div className="w-36 h-20 bg-gray-100 rounded-md flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-2/3" aria-hidden="true" />
        <div className="h-2 bg-gray-100 rounded w-1/3" aria-hidden="true" />
      </div>
      <div className="w-16 h-3 bg-gray-100 rounded" aria-hidden="true" />
    </div>
  );
}

export default function Trending() {
  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Visually-hidden link to uploaded file (tooling will transform path to URL) */}
        <Link to="/mnt/data/Help.jsx" className="sr-only" aria-hidden={false}>Help file</Link>

        {/* Banner */}
         
        {/* Grid of trending cards (many shimmers) */}
        <section className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <CardPlaceholder />
              </div>
            ))}
          </div>
        </section>

        {/* Long vertical list to emphasize "loading text" look */}
        <section className="bg-white border-4 border-gray-100 rounded-3xl p-4 shadow-sm ">
          <div className="space-y-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <RowPlaceholder key={i} />
            ))}
          </div>
        </section>

        {/* Footer area full-width shimmer blocks */}
        <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative bg-white border border-gray-100 rounded-lg p-4 overflow-hidden">
            <ShimmerLayer />
            <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" aria-hidden="true" />
            <div className="h-3 bg-gray-100 rounded w-1/2" aria-hidden="true" />
          </div>
          <div className="relative bg-white border border-gray-100 rounded-lg p-4 overflow-hidden">
            <ShimmerLayer />
            <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" aria-hidden="true" />
            <div className="h-3 bg-gray-100 rounded w-1/2" aria-hidden="true" />
          </div>
          <div className="relative bg-white border border-gray-100 rounded-lg p-4 overflow-hidden">
            <ShimmerLayer />
            <div className="h-6 bg-gray-100 rounded w-2/3 mb-3" aria-hidden="true" />
            <div className="h-3 bg-gray-100 rounded w-1/2" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
