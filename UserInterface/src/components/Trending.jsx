import React from "react";
import PageContainer from "./layout/PageContainer";
import SkeletonLoader from "./common/SkeletonLoader";

export default function Trending() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Trending Videos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover popular videos trending right now</p>
      </div>
      <SkeletonLoader count={12} />
    </PageContainer>
  );
}

