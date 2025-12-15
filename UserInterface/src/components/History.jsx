// /mnt/data/History.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";

axios.defaults.withCredentials = true;

function formatDate(dateString) {
  return dateString
    ? formatDistanceToNowStrict(new Date(dateString), { addSuffix: true })
    : "";
}

function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/v1/account/history", {
          withCredentials: true,
        });
        setHistory(response.data.data || []); // ensure array
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []); // Empty dependency array to run the effect only once

  return (
    <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
      <div className="mb-4 col-span-full xl:mb-2">
        <div className="text-lg mb-8 ">
          <h1 className="text-4xl font-semibold mb-4">History</h1>
        </div>
        <br />

        {isLoading ? (
          <div className="text-center my-72">
            <div className="p-4 text-center">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin fill-black"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {history.length > 0 ? (
              <section>
                <div className="container">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {history.map((video) => (
                      <div
                        key={video._id}
                        className="bg-white rounded-lg overflow-hidden"
                      >
                        {/* Card similar to Home/VideoCard */}
                        <div className="p-0">
                          <Link to={`/watch/${video._id}`}>
                            <div
                              className="w-full rounded-2xl bg-gray-200 overflow-hidden"
                              style={{
                                paddingTop: "56.25%",
                                position: "relative",
                                borderRadius: "12px",
                              }}
                            >
                              <img
                                src={getThumbnailUrl(video)}
                                alt={video.title}
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
                                {formatDuration(video?.duration ?? 0)}
                              </span>
                            </div>
                          </Link>

                          {/* Channel row: avatar, title, channel, views */}
                          <div className="flex items-start gap-3 p-3">
                            <img
                              src={video?.owner?.avatar}
                              alt={video?.owner?.name}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[1rem] truncate">
                                <Link to={`/watch/${video._id}`}>
                                  {video.title}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {video.owner?.name ?? "Unknown Channel"}
                              </p>
                              <div className="text-sm text-gray-500 mt-1">
                                {video.views ?? 0} views • {formatDate(video?.createdAt)}
                              </div>
                            </div>

                            {/* three-dots / actions (keeps existing UI affordance) */}
                            <div className="ml-2">
                              <button className="rounded-all hover:bg-gray-50 rounded-3xl focus:scale-90 focus:bg-gray-200 rounded-[2rem] transition-all duration-50 p-2">
                                <img
                                  src="/src/assets/svg_icons/threeDots.svg"
                                  alt="More"
                                  className="w-7 h-7"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <div>No history available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
