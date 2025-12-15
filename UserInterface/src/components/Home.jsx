import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
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
  const [videosAll, setVideosAll] = useState([]); // full fetched list
  const [displayed, setDisplayed] = useState([]); // progressively shown videos
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const timersRef = useRef([]);

  const [me, setMe] = useState(null);

  const [openMenuFor, setOpenMenuFor] = useState(null); // videoId
  const [confirmDeleteFor, setConfirmDeleteFor] = useState(null); // videoId

  useEffect(() => {
    axios
      .get("/api/v1/account/me", { withCredentials: true })
      .then((res) => setMe(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setFetching(true);
    setError(null);

    (async () => {
      try {
        const response = await axios.get("/api/v1/videos/allVideo", {
          withCredentials: true,
        });

        if (!mounted) return;

        const data = response?.data?.data ?? [];
        setVideosAll(Array.isArray(data) ? data : []);
        setDisplayed([]);

        // Stagger reveal over ~3 seconds total
        const totalMs = 3000;
        const count = Array.isArray(data) ? data.length : 0;
        if (count > 0) {
          const interval = Math.max(60, Math.floor(totalMs / count)); // minimum interval guard
          data.forEach((item, idx) => {
            const t = setTimeout(() => {
              setDisplayed((prev) => [...prev, item]);
            }, interval * (idx + 1));
            timersRef.current.push(t);
          });
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        if (!mounted) return;
        setError("Unable to load videos.");
      } finally {
        if (!mounted) return;
        setFetching(false);
      }
    })();

    return () => {
      mounted = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const placeholderCount = fetching
    ? 8
    : Math.max(0, (videosAll?.length || 0) - displayed.length);

  return (
    <>
      <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
        <div className="mb-4 col-span-full xl:mb-2">
          <section>
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Render revealed videos first */}
                {displayed.map((video) => (
                  <div key={video._id}>
                    {/* Duration Display on thumbnail */}
                    <div className="relative">
                      <Link to={`/watch/${video._id}`}>
                        <div
                          className="w-full rounded-lg bg-gray-100 overflow-hidden"
                          style={{ paddingTop: "56.25%", position: "relative" }} // 16:9 aspect ratio
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
                              // single fixed fallback image for missing/broken thumbnails
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
                    {/*  Card :  Video Title - Video Owner - Date - Menu   */}
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
                          className="hover:bg-gray-100 p-2 rounded-full"
                        >
                          <img
                            src="/src/assets/svg_icons/threeDots.svg"
                            className="w-6 h-6"
                          />
                        </button>

                        {openMenuFor === video._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow z-50">
                            <Link
                              to={`/reportForm/${video._id}`}
                              onClick={() => setOpenMenuFor(null)}
                              className="block w-full text-left px-4 py-2 text-sm
             hover:bg-gray-100 transition"
                            >
                              🚩 Report
                            </Link>

                            {me?.role === "admin" && (
                              <button
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-xl"
                                onClick={() => {
                                  setOpenMenuFor(null);
                                  setConfirmDeleteFor(video._id);
                                }}
                              >
                                🗑 Delete (Admin)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {confirmDeleteFor && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80">
                      <h2 className="font-semibold text-red-600">
                        Delete video?
                      </h2>
                      <p className="text-sm text-gray-600 mt-2">
                        This action is irreversible.
                      </p>

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setConfirmDeleteFor(null)}
                          className="px-3 py-1 bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            await axios.delete(
                              `/api/v1/videos/delete/${confirmDeleteFor}`
                            );
                            setVideosAll((v) =>
                              v.filter((x) => x._id !== confirmDeleteFor)
                            );
                            setDisplayed((v) =>
                              v.filter((x) => x._id !== confirmDeleteFor)
                            );
                            setConfirmDeleteFor(null);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placeholders for unrevealed videos */}
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
    </>
  );
}
