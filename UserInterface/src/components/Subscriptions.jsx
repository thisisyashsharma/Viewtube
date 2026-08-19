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
  const [modalSearch, setModalSearch] = useState("");
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

    // 2. Filter by specifically selected channel from top story bar
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
      setSelectedChannelId(null);
    } else {
      setSelectedChannelId(channelId);
    }
  };

  const selectedChannelObj = channels.find((c) => String(c._id) === String(selectedChannelId));

  // Filter channels in modal by search query
  const filteredModalChannels = useMemo(() => {
    if (!modalSearch.trim()) return channels;
    return channels.filter((c) =>
      c.name?.toLowerCase().includes(modalSearch.toLowerCase()) ||
      c.username?.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [channels, modalSearch]);

  if (loading) {
    return (
      <PageContainer className="!px-0 !py-0 sm:!px-6 sm:!py-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white tracking-tight">
              Subscriptions
            </h1>
          </div>
          <SkeletonLoader count={8} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="!px-0 !py-0 sm:!px-6 sm:!py-6">
      <div className="max-w-7xl mx-auto px-0 pb-28 sm:pb-16 space-y-3 sm:space-y-4">
        
        {/* ── 1. Top Android-Style Horizontal Channels Carousel & Manage Action ── */}
        <div className="bg-white dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5 py-2.5 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">
                Channels
              </h2>
              {channels.length > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-400">
                  {channels.length}
                </span>
              )}
            </div>

            {channels.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllModal(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Manage</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Horizontally Scrollable Channel Avatars Row */}
          {channels.length === 0 ? (
            <div className="py-2 text-xs text-gray-500 dark:text-gray-400">
              You haven't subscribed to any channels yet.
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-1">
              {/* "All" Master Filter Chip */}
              <button
                type="button"
                onClick={() => setSelectedChannelId(null)}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                    selectedChannelId === null
                      ? "bg-gray-950 dark:bg-white text-white dark:text-gray-950 ring-2 ring-gray-950/20 dark:ring-white/30"
                      : "bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-[#282828]"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold max-w-[56px] truncate text-center mt-1 transition-colors ${
                    selectedChannelId === null
                      ? "text-gray-950 dark:text-white font-bold"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                  }`}
                >
                  All
                </span>
              </button>

              {/* Subscribed Channels */}
              {channels.map((ch) => {
                const isSelected = String(selectedChannelId) === String(ch._id);
                return (
                  <button
                    key={ch._id}
                    type="button"
                    onClick={() => handleChannelClick(ch._id)}
                    className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
                  >
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-colors shadow-2xs ${
                        isSelected
                          ? "border-gray-950 dark:border-white ring-2 ring-gray-950/20 dark:ring-white/30"
                          : "border-gray-200 dark:border-gray-800 group-hover:border-gray-400 dark:group-hover:border-gray-600"
                      }`}
                    >
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium max-w-[60px] truncate text-center mt-1 transition-colors ${
                        isSelected
                          ? "text-gray-950 dark:text-white font-bold"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
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

        {/* ── 2. Filter Pills Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-0.5">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === option
                  ? "bg-gray-950 dark:bg-white text-white dark:text-black shadow-2xs font-bold"
                  : "bg-gray-100 dark:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-white/5 hover:bg-gray-200/80 dark:hover:bg-[#282828]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* ── 3. Selected Channel Active Filter Banner ── */}
        {selectedChannelObj && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 mx-4 sm:mx-0 rounded-2xl bg-gray-100/90 dark:bg-[#181818] border border-gray-200/80 dark:border-white/10 shadow-2xs animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={selectedChannelObj.avatar}
                alt={selectedChannelObj.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-300 dark:border-gray-700"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-950 dark:text-white truncate block">
                  Showing videos from <span className="font-bold">{selectedChannelObj.name}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/channel/${selectedChannelObj._id}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Visit Channel →
              </Link>
              <button
                type="button"
                onClick={() => setSelectedChannelId(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors cursor-pointer"
                title="Clear channel filter"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── 4. Edge-to-Edge Pure Video Grid Feed (Android Native Look) ── */}
        {displayedVideos.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState
              title="No videos found"
              description={
                selectedChannelObj
                  ? `No uploads found for ${selectedChannelObj.name} under the "${activeFilter}" filter.`
                  : "Your subscribed channels haven't posted any videos matching this filter."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-6 sm:gap-6">
            {displayedVideos.map((video) => (
              <div
                key={video._id}
                className="bg-transparent sm:bg-white dark:sm:bg-[#141414] rounded-none sm:rounded-2xl border-0 sm:border border-gray-200/80 dark:border-white/10 p-0 sm:p-3 shadow-none sm:shadow-2xs"
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. Manage Subscriptions Modal (Searchable + Fast) ── */}
      {showAllModal && (
        <div
          id="all-channels-modal"
          onClick={(e) => {
            if (e.target.id === "all-channels-modal") setShowAllModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white dark:bg-[#141414] rounded-3xl max-w-md w-full max-h-[82vh] flex flex-col shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#181818] flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white tracking-tight">
                  Subscribed Channels
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {channels.length} {channels.length === 1 ? "channel" : "channels"} subscribed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Subscribed Channels */}
            {channels.length > 5 && (
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Search your channels..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1f1f1f] text-xs text-gray-950 dark:text-white border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Subscribed Channels List with 1-Click SubscribeButton */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredModalChannels.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-400">
                  {modalSearch ? "No channels match your search." : "No subscriptions yet."}
                </div>
              ) : (
                filteredModalChannels.map((ch) => (
                  <div
                    key={ch._id}
                    className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#222] rounded-2xl border border-gray-200/70 dark:border-white/5 transition-colors"
                  >
                    <Link
                      to={`/channel/${ch._id}`}
                      onClick={() => setShowAllModal(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={ch.avatar}
                        alt={ch.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-950 dark:text-white truncate">
                          {ch.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          @{ch.username ?? "-"} • {ch.subscribersCount?.toLocaleString() ?? 0} subs
                        </p>
                      </div>
                    </Link>
                    <div className="shrink-0">
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
