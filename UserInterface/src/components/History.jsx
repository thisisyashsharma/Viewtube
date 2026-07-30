import React, { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "./layout/PageContainer";
import VideoGrid from "./layout/VideoGrid";
import VideoCard from "./VideoCard";
import SkeletonLoader from "./common/SkeletonLoader";
import EmptyState from "./common/EmptyState";

axios.defaults.withCredentials = true;


function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/v1/account/history", {
          withCredentials: true,
        });
        setHistory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 px-4 sm:px-0">Watch History</h1>
        <SkeletonLoader count={8} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Watch History</h1>
        <span className="text-sm font-medium text-gray-500">
          {history.length} {history.length === 1 ? "video" : "videos"}
        </span>
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No watch history"
          description="Videos you watch will show up here."
        />
      ) : (
        <VideoGrid>
          {history.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </VideoGrid>
      )}
    </PageContainer>
  );
}

export default History;
