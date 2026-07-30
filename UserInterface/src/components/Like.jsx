import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./layout/PageContainer";
import VideoGrid from "./layout/VideoGrid";
import VideoCard from "./VideoCard";
import SkeletonLoader from "./common/SkeletonLoader";
import EmptyState from "./common/EmptyState";

export default function Like() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        let response;
        try {
          response = await axios.get("/api/v1/videos/likes", {
            withCredentials: true,
          });
        } catch {
          response = await axios.get("/api/v1/likes", {
            withCredentials: true,
          });
        }

        const raw = response.data?.data;
        const items = Array.isArray(raw)
          ? raw
          : raw?.likedVideos || raw?.videos || [];

        setLikedVideos(
          items.map((item) => (item?.video ? item.video : item)).filter(Boolean)
        );
      } catch (error) {
        console.error("Error fetching likes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 px-4 sm:px-0">Liked Videos</h1>
        <SkeletonLoader count={8} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Liked Videos</h1>
        <span className="text-sm font-medium text-gray-500">
          {likedVideos.length} {likedVideos.length === 1 ? "video" : "videos"}
        </span>
      </div>

      {likedVideos.length === 0 ? (
        <EmptyState
          title="No liked videos"
          description="Videos you like will appear here."
        />
      ) : (
        <VideoGrid>
          {likedVideos.map((video) => (
            <VideoCard key={video._id || video.id} video={video} />
          ))}
        </VideoGrid>
      )}
    </PageContainer>
  );
}
