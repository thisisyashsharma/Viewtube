import axios from "axios";
import React, { useEffect, useState } from "react";
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


  if (loader) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 px-4 sm:px-0">Your Videos</h1>
        <SkeletonLoader count={8} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900">Your Videos</h1>
        <span className="text-sm font-medium text-gray-500">
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </span>
      </div>

      {videos.length === 0 ? (
        <EmptyState
          title="No uploaded videos"
          description="You haven't uploaded any videos yet."
        />
      ) : (
        <VideoGrid>
          {videos.map((video) => (
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
    </PageContainer>
  );
}

export default AllVideo;
