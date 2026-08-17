import React from "react";
import PageContainer from "./layout/PageContainer";
import EmptyState from "./common/EmptyState";

function Playlist() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Playlists</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your saved video playlists</p>
      </div>

      <EmptyState
        title="No playlists created"
        description="Save your favorite videos into custom playlists to watch them later."
      />
    </PageContainer>
  );
}

export default Playlist;