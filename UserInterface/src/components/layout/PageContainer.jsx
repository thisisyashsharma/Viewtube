import React from "react";

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`px-4 sm:px-8 lg:px-12 py-4 sm:py-6 w-full max-w-screen-2xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
