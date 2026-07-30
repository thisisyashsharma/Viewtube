import React from "react";

export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`px-0 sm:px-6 py-4 w-full ${className}`}>
      {children}
    </div>
  );
}
