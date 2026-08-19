import React from "react";

export default function VideoGrid({ children, className = "" }) {
  return (
    <div
      className={`grid gap-y-6 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${className}`}
    >
      {children}
    </div>
  );
}
