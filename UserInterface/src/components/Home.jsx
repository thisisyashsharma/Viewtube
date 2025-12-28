import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";

axios.defaults.withCredentials = true;

function ShimmerCard() {
  return (
    <div className="relative bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="absolute inset-0 pointer-events-none shimmer-only-here" />
      <div className="p-3 space-y-2">
        <div className="w-full h-40 bg-gray-100 rounded-xl" />
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      </div>
      <style>{`
        .shimmer-only-here {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.65) 50%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer-only-here-kf 0.5s infinite linear;
        }
        @keyframes shimmer-only-here-kf {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
function formatDate(dateString) {
  return dateString
    ? formatDistanceToNowStrict(new Date(dateString), { addSuffix: true })
    : "";
}

export default function Home() {
  const hasFetchedRef = useRef(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const filter = searchParams.get("filter") || "relevance";
  const navigate = useNavigate();

  const [videosAll, setVideosAll] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const timersRef = useRef([]);

  const [me, setMe] = useState(null);
  useEffect(() => {
    axios
      .get("/api/v1/account/me", { withCredentials: true })
      .then((res) => setMe(res.data.data))
      .catch(() => {});
  }, []);

  const [openMenuFor, setOpenMenuFor] = useState(null); // videoId
  const [confirmDeleteFor, setConfirmDeleteFor] = useState(null); // videoId
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuFor(null);
      }
    };

    if (openMenuFor !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuFor]);

  // Fetch videos based on search or normal
  const fetchVideos = useCallback(async () => {
    if (hasFetchedRef.current) return; // 🔐 block second run
    hasFetchedRef.current = true; //  add this

    let mounted = true;
    setFetching(true);
    setError(null);
    setDisplayed([]); // Clear displayed videos immediately

    // Clear any existing timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    try {
      let response;
      let data = [];

      if (searchQuery && searchQuery.trim().length > 0) {
        // Search mode
        setIsSearchMode(true);
        response = await axios.get("/api/v1/videos/search", {
          params: {
            query: searchQuery.trim(),
            limit: 50,
            sort: filter,
          },
          withCredentials: true,
        });
        data = response?.data?.data?.videos ?? [];
      } else {
        // Normal mode - show all videos
        setIsSearchMode(false);
        response = await axios.get("/api/v1/videos/allVideo", {
          withCredentials: true,
        });
        data = response?.data?.data ?? [];
      }

      if (!mounted) return;

      setVideosAll(Array.isArray(data) ? data : []);

      // If no data, show empty state immediately
      if (!data || data.length === 0) {
        setFetching(false);
        return;
      }

      // Stagger reveal animation
      const totalMs = 3000;
      const count = data.length;
      const interval = Math.max(60, Math.floor(totalMs / count));

      data.forEach((item, idx) => {
        const t = setTimeout(() => {
          if (mounted) {
            setDisplayed((prev) =>
              prev.some((v) => v._id === item._id) ? prev : [...prev, item]
            );
          }
        }, interval * (idx + 1));
        timersRef.current.push(t);
      });

      // Set timeout to ensure fetching state ends
      const finalTimer = setTimeout(() => {
        if (mounted) {
          setFetching(false);
        }
      }, totalMs + 500);
      timersRef.current.push(finalTimer);
    } catch (err) {
      console.error("Error fetching videos:", err);
      if (!mounted) return;
      setError("Unable to load videos.");
      setFetching(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    fetchVideos();

    // Cleanup function
    return () => {
      hasFetchedRef.current = false; // 🔄 allow future reloads
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [fetchVideos]);

  const placeholderCount = fetching
    ? Math.min(8, videosAll.length > 0 ? videosAll.length : 8)
    : Math.max(0, (videosAll?.length || 0) - displayed.length);

  // Filter options
  const filterOptions = [
    { key: "relevance", label: "Relevance" },
    { key: "newest", label: "New Videos" },
    { key: "most_liked", label: "Most Liked" },
    { key: "most_commented", label: "Most Commented" },
    { key: "username", label: "Username" },
  ];

  const handleFilterChange = (filterKey) => {
    // Update URL with new filter without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filterKey);
    navigate(`?${params.toString()}`);
  };

  // Clear search button handler
  const handleClearSearch = () => {
    navigate("/home");
  };

  return (
    <>
      <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
        <div className="mb-4 col-span-full xl:mb-2">
          {/* Search Results Header */}
          {isSearchMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">
                  Search results for "{searchQuery}"
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({videosAll.length} videos)
                  </span>
                </h1>
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  Clear Search
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleFilterChange(option.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filter === option.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Normal mode header */}
          {!isSearchMode && !fetching && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">
                Recommended Videos
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({videosAll.length} videos)
                </span>
              </h1>
            </div>
          )}

          <section>
            <div className="container">
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchVideos}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Render revealed videos first */}
                  {displayed.map((video) => (
                    <div key={video._id}>
                      <div className="relative">
                        <Link to={`/watch/${video._id}`}>
                          <div
                            className="w-full rounded-lg bg-gray-100 overflow-hidden"
                            style={{
                              paddingTop: "56.25%",
                              position: "relative",
                            }}
                          >
                            <img
                              src={getThumbnailUrl(video)}
                              alt={video?.title || "video thumbnail"}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                if (!e.currentTarget.dataset.fallbackApplied) {
                                  e.currentTarget.src =
                                    "http://localhost:8000/placeholders/noThumbnail.png";
                                  e.currentTarget.dataset.fallbackApplied =
                                    "true";
                                }
                              }}
                            />
                            <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                              {formatDuration(video?.duration ?? 0)}
                            </span>
                          </div>
                        </Link>
                      </div>

                      <div className="flex items-start justify-between w-full md:mt-0 text-[0.9rem] font-medium text-gray-500 ">
                        <div className="px-1 py-2 flex items-start gap-2">
                          <img
                            src={video?.owner?.avatar}
                            alt={video?.owner?.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="flex flex-col overflow-hidden">
                            <h3 className="font-semibold text-[1rem] truncate">
                              <Link to={`/watch/${video._id}`}>
                                {video.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {video?.owner?.name ?? ""}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {video.views ?? 0} views •{" "}
                              {formatDate(video.createdAt)}
                            </p>
                          </div>
                        </div>
                        {/* THREE DOT MENU */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuFor(
                                openMenuFor === video._id ? null : video._id
                              )
                            }
                            className="focus:bg-gray-200 p-2 rounded-full  focus:scale-[0.8] transition-all duration-200"
                          >
                            <img
                              src="/src/assets/svg_icons/threeDots.svg"
                              className="w-6 h-6"
                            />
                          </button>

                          <div
                            ref={menuRef}
                            className={` absolute text-gray-900 right-0 top-10 mt-2 w-40 p-1 flex flex-col rounded-[0.7rem] z-10 bg-gray-100 border-4 border-gray-50 
                                ${
                                  me?.role === "admin"
                                    ? "justify-between"
                                    : "justify-center"
                                } transform transition-all duration-200 ease-out origin-top-right 
                                ${
                                  openMenuFor === video._id
                                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                }`}
                          >
                            <div>
                              <Link
                                to={`/reportForm/${video._id}`}
                                onClick={() => setOpenMenuFor(null)}
                                className="block w-full text-left  px-4 py-2 hover:bg-gray-200 transition rounded-[0.5rem] "
                              >
                                ⚠️ Report
                              </Link>
                            </div>
                            <div>
                              {(me?.role === "admin" ||
                                video?.owner?._id === me?._id) && (
                                <button
                                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-[0.5rem]"
                                  onClick={() => {
                                    setOpenMenuFor(null);
                                    setConfirmDeleteFor(video._id);
                                  }}
                                >
                                  ❌ Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Placeholders for unrevealed videos */}
                  {Array.from({ length: placeholderCount }).map((_, i) => (
                    <div key={`ph-${i}`}>
                      <ShimmerCard />
                    </div>
                  ))}
                </div>
              )}

              {/* No results message for search */}
              {!fetching && isSearchMode && videosAll.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No videos found for "{searchQuery}"
                  </p>
                  <p className="text-gray-400 mt-2">
                    Try different keywords or check spelling
                  </p>
                </div>
              )}

              {/* Empty state for normal mode */}
              {!fetching &&
                !isSearchMode &&
                videosAll.length === 0 &&
                !error && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No videos available yet
                    </p>
                    <p className="text-gray-400 mt-2">
                      Be the first to upload a video!
                    </p>
                  </div>
                )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
