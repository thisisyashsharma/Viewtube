import React from "react";

export default function SkeletonLoader({ count = 8, isShorts = false }) {
  return (
    <div
      className={`grid gap-4 sm:gap-6 ${
        isShorts
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      }`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-3 animate-shimmer rounded-xl p-1 bg-white/50">
          <div
            className={`w-full bg-gray-200/60 rounded-xl ${
              isShorts ? "aspect-[9/16]" : "aspect-video"
            }`}
          />
          <div className="flex space-x-3">
            {!isShorts && (
              <div className="w-9 h-9 bg-gray-200/60 rounded-full flex-shrink-0" />
            )}
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200/60 rounded w-5/6" />
              <div className="h-3 bg-gray-200/60 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
