import React from "react";

export default function ShortsGrid({ children, className = "" }) {
  return (
    <div
      className={`grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${className}`}
    >
      {children}
    </div>
  );
}
