// /mnt/data/Like.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";

/**
 * Like.jsx
 * - Responsive grid (same look as Home).
 * - Safe fetch for liked videos.
 * - Persistent shimmer placeholders and a staggered reveal that completes in ~5.5s total.
 * - Replace existing file at: /mnt/data/Like.jsx
 */

function ShimmerCard() {
  return (
    <div className="relative bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="absolute inset-0 pointer-events-none shimmer-only-here" />
      <div className="p-3 space-y-2">
        <div className="w-full h-40 bg-gray-100 rounded-xl" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
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

export default function Like() {
  const [likedAll, setLikedAll] = useState([]); // full array from API
  const [displayed, setDisplayed] = useState([]); // progressively shown items
  const [fetching, setFetching] = useState(true); // network fetch in progress
  const [revealing, setRevealing] = useState(false); // staggered reveal in progress
  const [processingIds, setProcessingIds] = useState(new Set());
  const [error, setError] = useState(null);

  const timersRef = useRef([]);

  const API_LIKES = "/api/v1/likes";
  const API_UNLIKE = (id) => `/api/v1/videos/likes/${id}/like`;

  useEffect(() => {
    let mounted = true;
    setFetching(true);
    setError(null);

    const token = localStorage.getItem("token");

    (async () => {
      try {
        const res = await fetch(API_LIKES, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!res.ok) {
          const ct = res.headers.get("content-type") || "";
          const body = ct.includes("application/json")
            ? await res.json()
            : await res.text();
          console.error("Likes API error:", res.status, body);
          throw new Error(
            typeof body === "string" ? body : JSON.stringify(body)
          );
        }

        const ct = res.headers.get("content-type") || "";
        let data;
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(
            `Expected JSON but server returned: ${text.slice(0, 400)}`
          );
        }

        if (!mounted) return;

        // normalize response into an array of video objects
        let likedVideos = [];
        if (Array.isArray(data)) likedVideos = data;
        else if (Array.isArray(data.data)) likedVideos = data.data;
        else if (Array.isArray(data.liked)) likedVideos = data.liked;
        else if (Array.isArray(data.videos)) likedVideos = data.videos;
        else if (Array.isArray(data.payload)) likedVideos = data.payload;
        else {
          const maybeArray = Object.values(data).find((v) => Array.isArray(v));
          if (Array.isArray(maybeArray)) likedVideos = maybeArray;
        }

        setLikedAll(likedVideos || []);
        setDisplayed([]); // clear displayed before reveal
        if ((likedVideos || []).length > 0) {
          // start staggered reveal
          setRevealing(true);
          const totalMs = 3000; // ~5.5 seconds total reveal time
          const count = likedVideos.length;
          const interval = Math.max(100, Math.floor(totalMs / count)); // at least 100ms per item
          likedVideos.forEach((item, idx) => {
            const t = setTimeout(() => {
              setDisplayed((prev) => [...prev, item]);
              // when last one added, stop revealing
              if (idx === count - 1) {
                setRevealing(false);
              }
            }, interval * (idx + 1));
            timersRef.current.push(t);
          });
        } else {
          setRevealing(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch liked videos:", err);
        setError(err?.message || "Unable to load liked videos.");
      } finally {
        if (!mounted) return;
        setFetching(false);
      }
    })();

    return () => {
      mounted = false;
      // clear reveal timers on unmount
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const handleUnlike = async (id) => {
    if (!id) return;
    setProcessingIds((s) => new Set([...s, id]));

    // optimistic UI: remove from both displayed and likedAll
    const prevAll = likedAll;
    const prevDisplayed = displayed;
    
    setLikedAll((list) => list.filter((v) => (v._id || v.id) !== id));
    setDisplayed((list) => list.filter((v) => (v._id || v.id) !== id));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/videos/${id}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.error("Failed to unlike:", err);
      // rollback
      setLikedAll(prevAll);
      setDisplayed(prevDisplayed);
      setError("Failed to remove like. Try again.");
    } finally {
      setProcessingIds((s) => {
        const copy = new Set(s);
        copy.delete(id);
        return copy;
      });
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? formatDistanceToNowStrict(new Date(dateString), { addSuffix: true })
      : "";

  // Determine how many placeholders to show:
  // - while fetching: show 6 placeholders
  // - after fetch but while revealing: show (likedAll.length - displayed.length) placeholders
  // - finish: 0 placeholders
  const placeholderCount = fetching
    ? 6
    : revealing
    ? Math.max(0, likedAll.length - displayed.length)
    : 0;

  return (
    <div className="min-h-screen lg:mt-12 mx-4 px-4 py-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Liked videos</h1>
          <p className="mt-1 text-sm text-gray-600">Videos you have liked</p>
        </header>

        <section className="">
          {error ? (
            <div className="p-6 bg-white border-2 border-red-100 rounded-xl text-red-600">
              <div className="whitespace-pre-wrap">{String(error)}</div>
            </div>
          ) : displayed.length === 0 && fetching ? (
            // Initial fetch shimmer
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          ) : displayed.length === 0 && !fetching && likedAll.length === 0 ? (
            // Empty: fetched but no liked videos
            <div className="p-8 bg-white border-4 border-gray-100 rounded-3xl text-center">
              <div className="text-gray-700 text-lg mb-2">
                No liked videos yet
              </div>
              <div className="text-sm text-gray-500">
                Like some videos to see them here.
              </div>
            </div>
          ) : (
            // Grid: displayed items + placeholders for the rest
            <div className="lg:mt-8 bg-white grid grid-cols-1 px-0 pt-2 xl:grid-cols-3 xl:gap-4">
              <div className="mb-4 col-span-full xl:mb-2">
                <section>
                  <div className="container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Render displayed (revealed) videos first */}
                      {displayed.map((video) => {
                        const id = video._id || video.id;
                        const v = video.video ? video.video : video;
                        const thumb =
                          v.thumbnail ||
                          v.thumbnails?.[0] ||
                          "/src/assets/placeholder-thumb.png";
                        const title = v.title || "Untitled";
                        const ownerName =
                          (v.owner && (v.owner.name || v.owner.username)) ||
                          v.channelName ||
                          v.ownerName ||
                          "";
                        const views =
                          typeof v.views !== "undefined"
                            ? v.views
                            : v.viewCount || "—";

                        return (
                          <div
                            key={id}
                            className="transition-opacity duration-300 ease-in"
                          >
                            <div className="relative">
                              <Link to={`/watch/${v._id || v.id}`}>
                                <div
                                  className="w-full rounded-2xl bg-gray-200 overflow-hidden"
                                  style={{
                                    paddingTop: "56.25%",
                                    position: "relative",
                                  }} // 16:9 aspect ratio
                                >
                                  <img
                                    src={getThumbnailUrl(v)}
                                    alt={title}
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "12px",
                                    }}
                                    onError={(e) => {
                                      if (
                                        !e.currentTarget.dataset.fallbackApplied
                                      ) {
                                        e.currentTarget.src =
                                          "http://localhost:8000/placeholders/noThumbnail.png";
                                        e.currentTarget.dataset.fallbackApplied =
                                          "true";
                                      }
                                    }}
                                  />
                                  <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                                    {formatDuration(v?.duration ?? 0)}
                                  </span>
                                </div>
                              </Link>
                            </div>

                            <div className="flex items-start justify-between w-full md:mt-0 text-[0.9rem] font-medium text-gray-500 ">
                              <div className=" px-4 py-2">
                                <div className="text-[1.05rem] text-black truncate">
                                  <Link to={`/watch/${v._id || v.id}`}>
                                    {title}
                                  </Link>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    {ownerName}
                                  </span>
                                </div>
                                <ul className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                  <li>{views} views</li>
                                  <li>•</li>
                                  <li>{formatDate(v.createdAt)}</li>
                                </ul>
                              </div>

                              <div className="pr-3 flex flex-col items-end">
                                <button
                                  onClick={() => handleUnlike(id)}
                                  disabled={processingIds.has(id)}
                                  className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs border bg-white text-red-600 border-red-100 hover:bg-red-50 focus:outline-none"
                                >
                                  {processingIds.has(id) ? "..." : "Unlike"}
                                </button>

                                <button className="rounded-all hover:bg-gray-50 rounded-3xl focus:scale-90 focus:bg-gray-200 rounded-[2rem] transition-all duration-50 mt-3">
                                  <img
                                    src="/src/assets/svg_icons/threeDots.svg"
                                    alt="More"
                                    className="fixed-size-icon w-10 h-10 p-2"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Render placeholders for still-unrevealed items */}
                      {Array.from({ length: placeholderCount }).map((_, i) => (
                        <div key={`ph-${i}`}>
                          <ShimmerCard />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
