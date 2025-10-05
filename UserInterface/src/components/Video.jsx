import React, { useState, useEffect } from "react";
import axios from "axios";
// import image from "../assets/profile-picture-5.jpg";
import { Link, useParams } from "react-router-dom";

import { useRef } from "react"; //EU6u1.p2.a1.1ln - Views Increment - updated one lines to target exact video elements

function Video() {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null); //EU6u1.p2.a3.1ln - Views Increment - id -> null, we'll fetch real object below
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null); //EU6u1.p2.a2.1ln - Views Increment -to target exact video elements
  const [liked, setLiked] = useState(false); //EU6u2.p3.a1.2ln - Like feature - +2 states - liked and likesCount
  const [likesCount, setLikesCount] = useState(0);

  //EU6u3.p4.a1.2l - Subscribe feature: +2 states that are subscribe & subsCount
  const [subscribed, setSubscribed] = useState(false);
  const [subsCount, setSubsCount] = useState(0);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`/api/v1/videos/videoData/${id}`);
        setVideoData(response.data.data);
        //EU6u2.p3.a2.3ln - Like feature - it fetches initial like status;
        const st = await axios.get(`/api/v1/videos/${id}/like/status`);
        setLiked(st.data.data.liked);
        setLikesCount(st.data.data.count);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  //EU6u2.p3.a3.10ln - Like feature : + toggle handler function
  const onToggleLike = async () => {
    try {
      const res = await axios.put(`/api/v1/videos/${id}/like`);
      const { liked, count } = res.data.data;
      setLiked(liked);
      setLikesCount(count);
    } catch (e) {
      console.error("Toggle like failed:", e);
    }
  };

  //EU6u1.p1.27ln - Views Increment - only if user plays video for few second - replaced 10L - 27L
  /*
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        await axios.put(`/api/v1/videos/incrementView/${id}`);
        console.log("View count incremented");
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    };
    incrementViewCount();
  }, [id]);
  */

  useEffect(() => {
    if (loading) return; // wait until video is rendered

    let viewSent = false;
    const el = videoRef.current;
    if (!el) return;

    const handler = async () => {
      if (viewSent) return;
      const dur = el.duration || 0;
      const watchedEnough =
        el.currentTime >= 3 || (dur && el.currentTime / dur >= 0.1);
      if (!watchedEnough) return;
      viewSent = true;
      try {
        await axios.put(`/api/v1/videos/incrementView/${id}`);
        // Optimistically update local UI so the eye badge bumps immediately
        setVideoData((prev) =>
          prev ? { ...prev, views: (prev.views || 0) + 1 } : prev
        );
        // (optional) mark watch-history at the same moment
        await axios.put(`/api/v1/account/addToHistory/${id}`);
      } catch (err) {
        console.error("View/watch update failed:", err);
      }
    };

    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, [id, loading]);

  /*
//EU6u1.p2.a4.0ln - Views Increment - commenting next 11 lines - as the reason i found - removed the separate addToWatchHistory effect to prevent double inserts,  (Your old effect here was causing duplicates.)

useEffect(() => {
  const addToWatchHistory = async () => {
      try {
        await axios.put(`/api/v1/account/addToHistory/${id}`);
        console.log("addToWatchHistory");
      } catch (error) {
        console.error("Error addToWatchHistory:", error);
      }
    };
    addToWatchHistory();
  }, [id]);
*/

  useEffect(() => {
    if (videoData && videoData.owner) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `/api/v1/account/userData/${videoData.owner}`
          );
          setUserData(response.data.data);
          //EU6u3.p4.a2.3l - Subscribe feature: fetches initial status
          const st = await axios.get(
            `/api/v1/account/subscribe/status/${videoData.owner}`
          );
          setSubscribed(st.data.data.subscribed);
          setSubsCount(st.data.data.count);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUser();
    }
  }, [videoData]);

  // console.log(userData);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!videoData) {
    return <div>No video data found.</div>;
  }

  return (
    <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
      <div className="mb-4 col-span-full xl:mb-2">
        {/*-------------------content---------------------*/}
        <section className="pb-5 mt-3">
          <div className="container mx-auto">
            <div className="row">
              <div className="col-lg-9 col-xl-9">
                <section>
                  <div className="row">
                    <div className="col">
                      <div
                        className="relative video-wrap"
                        style={{ height: "465px" }}
                      >
                        {/* EU8u1.a1.p1.5ln - Thumbnail Fixing */}
                        {/* <div className="mb-4">
                          <img
                            src={videoData.thumbnail}
                            onError={(e) => {
                                // Prevent infinite loop
                                if (!e.currentTarget.dataset.fallbackApplied) {
                                  const randomIndex =
                                    Math.floor(Math.random() * 8) + 1; // 1–8
                                  e.currentTarget.src = `http://localhost:8000/placeholders/loading${randomIndex}.gif`;
                                  e.currentTarget.dataset.fallbackApplied =
                                    "true";
                                }
                              }}
                            alt={`${videoData.title} thumbnail`}
                            className="w-full h-64 object-cover rounded-md"
                          />
                        </div> */}

                        <video
                          ref={videoRef}
                          className=" w-full h-full"
                          controls
                        >
                          {" "}
                          {/* EU6u1.p2.a5.2wd - Views Increment - added ref={videoref} */}
                          {/* EU5u1.p1.10ln */}
                          {/* <source src={videoData.videoFile} type="video/mp4"/> */}
                          {(() => {
                            // If videoData.videoFile is a local URL that contains "/temp/", use the stream route
                            const isLocal =
                              typeof videoData.videoFile === "string" &&
                              videoData.videoFile.includes("/temp/");
                            if (isLocal) {
                              // extract filename from the URL (works for cloud or local full URLs)
                              const parts = videoData.videoFile.split("/");
                              const filename = parts[parts.length - 1];
                              return (
                                <source
                                  src={`http://localhost:8000/api/v1/videos/stream/${encodeURIComponent(
                                    filename
                                  )}`}
                                  type="video/mp4"
                                />
                              );
                            }
                            // default (Cloudinary or direct url)
                            return (
                              <source
                                src={videoData.videoFile}
                                type="video/mp4"
                              />
                            );
                          })()}
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-4">
                  <h1 className="mb-3 text-xl truncate">{videoData.title}</h1>

                  <div>
                    <div className="border-b border-b-gray-100">
                      <ul className="-mb-px flex items-center gap-5 text-sm font-sm">
                        <li>
                          {userData ? (
                            <Link className="inline-flex cursor-pointer items-center gap-3 px-1 py-3 text-black hover:text-gray-700 ">
                              <img
                                className="w-12 h-12 rounded-full"
                                src={userData.avatar}
                                alt="User"
                              />
                              {userData.name}
                            </Link>
                          ) : (
                            <div>Loading user data...</div>
                          )}
                        </li>

                        <li>
                          {/* EU6u2.p3.a4.11ln - Like feature - added a button for liking the video  */}
                          {/* <Link className="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-gray-600 hover:text-black"> */}
                          <button
                            onClick={onToggleLike}
                            className={[
                              "inline-flex items-center gap-2 px-2 py-2 rounded-xl transition",
                              liked
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700 hover:text-black",
                            ].join(" ")}
                            aria-pressed={liked}
                            aria-label={liked ? "Unlike" : "Like"}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                              />
                            </svg>
                            {/* EU6u2.p3.a5.4ln - Like feature - added a span - to show the likes in UI */}
                            <span className="px-2 py-0.5 text-xs font-semibold">
                              {likesCount}
                            </span>{" "}
                          </button>
                        </li>
                        <li>
                          <Link className="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-gray-600 hover:text-black">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                              {" "}
                              {videoData.views}
                              {" Views "}
                            </span>
                          </Link>
                        </li>
                        {/* EU6u3.p4.a3.45ln - Subscribe feature: replaced older button for subscribe and its logic 25ln -> 45ln */}

                        <li>
                          <button
                            onClick={async () => {
                              try {
                                const res = await axios.put(
                                  `/api/v1/account/subscribe/${videoData.owner}`
                                );
                                setSubscribed(res.data.data.subscribed);
                                setSubsCount(res.data.data.count);
                              } catch (e) {
                                console.error("Subscribe toggle failed:", e);
                              }
                            }}
                            className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl overflow-hidden border border-gray-200"
                            aria-pressed={subscribed}
                          >
                            {/* animated left→right fill */}
                            <span
                              className={`absolute top-0 bottom-0 left-0 z-0 transition-[width] duration-500 ${
                                subscribed
                                  ? "w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                  : "w-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                              }`}
                            />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className={`relative z-10 h-5 w-5 ${
                                subscribed ? "text-white" : "text-gray-600"
                              }`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span
                              className={`relative z-10 text-sm font-medium ${
                                subscribed ? "text-white" : "text-gray-700"
                              }`}
                            >
                              {subscribed ? "Subscribed" : "Subscribe"}
                            </span>
                            <span
                              className={`relative z-10 ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                subscribed
                                  ? "text-white bg-white/0"
                                  : "text-gray-600 bg-gray-100"
                              }`}
                            >
                              {subsCount}
                            </span>
                          </button>
                        </li>

                        <li>
                          <Link className="inline-flex cursor-pointer items-center gap-2 px-1 py-3 text-gray-600 hover:text-black">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                              />
                            </svg>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                              {formatDate(videoData.createdAt)}
                            </span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="truncate">{videoData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*-------------------content---------------------*/}
      </div>
    </div>
  );
}

export default Video;
