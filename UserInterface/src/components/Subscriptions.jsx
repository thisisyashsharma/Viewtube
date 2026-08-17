import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton.jsx";
import PageContainer from "./layout/PageContainer";
import EmptyState from "./common/EmptyState";
import SkeletonLoader from "./common/SkeletonLoader";
import VideoCard from "./VideoCard";

function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filterOptions = ["All", "Today", "Videos", "Shorts", "Live", "Podcasts"];

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscriptions and feed in parallel
      const [subsRes, feedRes] = await Promise.allSettled([
        axios.get("/api/v1/account/subscriptions"),
        axios.get("/api/v1/videos/subscribedFeed"),
      ]);

      let subbedChannels = [];
      if (subsRes.status === "fulfilled") {
        subbedChannels = subsRes.value?.data?.data?.channels || [];
      }
      setChannels(subbedChannels);

      let fetchedVideos = [];
      if (feedRes.status === "fulfilled") {
        const rawFeed = feedRes.value?.data?.data;
        fetchedVideos = Array.isArray(rawFeed) ? rawFeed : rawFeed?.videos || [];
      }

      // Fallback: If feed endpoint is empty or failed, fetch all videos
      if (fetchedVideos.length === 0) {
        try {
          const fallbackRes = await axios.get("/api/v1/videos/allVideo");
          const rawAll = fallbackRes?.data?.data;
          fetchedVideos = Array.isArray(rawAll) ? rawAll : rawAll?.videos || [];
        } catch (err) {
          console.error("Fallback allVideo fetch failed:", err);
        }
      }

      setAllVideos(fetchedVideos);
    } catch (e) {
      console.error("Failed to load subscriptions feed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort videos dynamically
  const displayedVideos = useMemo(() => {
    const subChannelIds = new Set(channels.map((c) => String(c._id)));

    // 1. Base list: Filter videos belonging to subscribed channels (fallback to all if no subs)
    let list =
      channels.length > 0
        ? allVideos.filter((v) => {
            const ownerId = v?.owner?._id ? String(v.owner._id) : String(v?.owner || "");
            return subChannelIds.has(ownerId);
          })
        : allVideos;

    // Fallback: If subscribed channels have no uploaded videos, show all available videos
    if (list.length === 0) list = allVideos;

    // 2. Filter by specifically selected channel from top carousel
    if (selectedChannelId) {
      list = list.filter((v) => {
        const ownerId = v?.owner?._id ? String(v.owner._id) : String(v?.owner || "");
        return ownerId === String(selectedChannelId);
      });
    }

    // 3. Filter by category pills
    if (activeFilter === "Today") {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      list = list.filter((v) => new Date(v.createdAt || Date.now()) >= oneDayAgo);
    } else if (activeFilter === "Shorts") {
      list = list.filter((v) => (v.duration ?? 0) < 60);
    } else if (activeFilter === "Videos") {
      list = list.filter((v) => (v.duration ?? 0) >= 60);
    }

    // 4. Sort by latest upload date descending
    return [...list].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [channels, allVideos, selectedChannelId, activeFilter]);

  const handleChannelClick = (channelId) => {
    if (selectedChannelId === channelId) {
      setSelectedChannelId(null); // Toggle off to show all subscribed channels
    } else {
      setSelectedChannelId(channelId);
    }
  };

  const selectedChannelObj = channels.find((c) => String(c._id) === String(selectedChannelId));

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
        </div>
        <SkeletonLoader count={6} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto px-0 sm:px-4">
        {/* Top Header Row with Subscribed Channels Carousel & 'All' Button */}
        <div className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800 sm:border-0 pb-2 mb-3 pt-2 sm:pt-0">
          <div className="flex items-center justify-between px-4 sm:px-0 mb-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                {selectedChannelObj ? selectedChannelObj.name : "Subscribed Channels"}
              </h2>
              {selectedChannelId && (
                <button
                  onClick={() => setSelectedChannelId(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  (Show All)
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAllModal(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              All
            </button>
          </div>

          {/* Horizontally Scrollable Channel Avatars Row */}
          {channels.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              No subscribed channels yet.
            </div>
          ) : (
            <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none px-4 sm:px-0 py-1.5">
              {channels.map((ch) => {
                const isSelected = String(selectedChannelId) === String(ch._id);
                return (
                  <button
                    key={ch._id}
                    onClick={() => handleChannelClick(ch._id)}
                    className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
                  >
                    <div
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-all shadow-2xs ${
                        isSelected
                          ? "ring-2 ring-blue-600 ring-offset-2 border-transparent scale-105"
                          : "border-gray-200 dark:border-gray-700 group-hover:border-blue-500"
                      }`}
                    >
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium max-w-[64px] truncate text-center mt-1 transition-colors ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                      }`}
                    >
                      {ch.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter Pills Bar matching screenshot */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none px-4 sm:px-0 mb-4 py-1">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === option
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-2xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Subscribed Feed Videos - Sorted by Latest Upload, No Border on Mobile */}
        {displayedVideos.length === 0 ? (
          <EmptyState
            title="No videos found"
            description={
              selectedChannelObj
                ? `No videos available for ${selectedChannelObj.name}.`
                : "Your subscribed channels haven't posted any videos matching this filter."
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedVideos.map((video) => (
              <div
                key={video._id}
                className="bg-transparent sm:bg-white dark:sm:bg-[#0f0f0f] rounded-none sm:rounded-2xl border-0 sm:border border-gray-200/80 dark:border-gray-800/80 p-0 sm:p-3 shadow-none sm:shadow-2xs"
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 'All' Channels Modal to manage subscriptions */}
      {showAllModal && (
        <div
          id="all-channels-modal"
          onClick={(e) => {
            if (e.target.id === "all-channels-modal") setShowAllModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                All Subscribed Channels ({channels.length})
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Subscribed Channels List with SubscribeButton */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {channels.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                  No subscriptions yet.
                </div>
              ) : (
                channels.map((ch) => (
                  <div
                    key={ch._id}
                    className="flex items-center justify-between gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 transition-colors"
                  >
                    <Link
                      to={`/channel/${ch._id}`}
                      onClick={() => setShowAllModal(false)}
                      className="flex items-center space-x-3 flex-1 min-w-0"
                    >
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {ch.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          @{ch.username ?? "-"} • {ch.subscribersCount?.toLocaleString() ?? 0} subscribers
                        </p>
                      </div>
                    </Link>
                    <div className="flex-shrink-0">
                      <SubscribeButton
                        channelId={ch._id}
                        defaultSubscribed={true}
                        onChange={(isSubbed) => {
                          if (!isSubbed) {
                            setChannels((prev) => prev.filter((c) => c._id !== ch._id));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default Subscriptions;
