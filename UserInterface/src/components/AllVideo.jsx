import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import PageContainer from "./layout/PageContainer";
import VideoGrid from "./layout/VideoGrid";
import VideoCard from "./VideoCard";
import SkeletonLoader from "./common/SkeletonLoader";
import EmptyState from "./common/EmptyState";
import EditVideoModal from "./EditVideoModal";

axios.defaults.withCredentials = true;

function AllVideo() {
  const userdata = useSelector((state) => state.auth.user);
  const [videos, setVideos] = useState([]);
  const [loader, setLoader] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [filter, setFilter] = useState("latest"); // "latest" | "popular" | "oldest"

  const fetchVideos = async () => {
    if (!userdata?._id) return;
    try {
      setLoader(true);
      const response = await axios.get(
        `/api/v1/videos/allUserVideo/${userdata._id}`,
        { withCredentials: true }
      );
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [userdata?._id]);

  const handleEdit = (video) => {
    setEditingVideo(video);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`/api/v1/videos/delete/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error("Failed to delete video:", err);
      alert(err?.response?.data?.message || "Failed to delete video.");
    }
  };

  const handleUpdateSuccess = (updatedVideo) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === updatedVideo._id
          ? {
              ...v,
              ...updatedVideo,
              owner: updatedVideo.owner || v.owner,
              thumbnail: updatedVideo.thumbnail
                ? `${updatedVideo.thumbnail.split("?")[0]}?t=${Date.now()}`
                : v.thumbnail,
            }
          : v
      )
    );
    // Also trigger background fetch to ensure full sync
    fetchVideos();
  };

  // Filtered and sorted videos
  const sortedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    const list = [...videos];
    if (filter === "popular") {
      return list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    if (filter === "oldest") {
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    // "latest"
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [videos, filter]);

  const filterTabs = [
    { key: "latest", label: "Latest" },
    { key: "popular", label: "Popular" },
    { key: "oldest", label: "Oldest" },
  ];

  if (loader) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-32 animate-shimmer" />
        </div>
        <SkeletonLoader count={8} />
      </div>
    );
  }

  return (
    <div className="mt-4 pb-28 sm:pb-12">
      {/* Header and Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4 sm:px-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Videos</h1>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </span>
        </div>

        {/* Filter Pills */}
        {videos.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                  filter === tab.key
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-2xs font-bold"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sortedVideos.length === 0 ? (
        <EmptyState
          title="No uploaded videos"
          description="You haven't uploaded any videos yet."
        />
      ) : (
        <VideoGrid>
          {sortedVideos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </VideoGrid>
      )}

      {/* Edit Video Metadata Modal */}
      <EditVideoModal
        video={editingVideo}
        isOpen={Boolean(editingVideo)}
        onClose={() => setEditingVideo(null)}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default AllVideo;
