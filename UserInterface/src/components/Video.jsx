import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useRef } from "react"; //EU6u1.p2.a1.1ln - Views Increment - updated one lines to target exact video elements
import Comments from "./Comments";
import { formatDistanceToNowStrict } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import AuthPromptModal from "./common/AuthPromptModal";
import { LineDrawIcon } from "./common";

import ThumbUpOffAltRoundedIcon from "@mui/icons-material/ThumbUpOffAltRounded"; // outline
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded"; // filled

import PageContainer from "./layout/PageContainer";

function Video() {
  const { id } = useParams();
  const authStatus = useSelector((state) => state.auth.status);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionContext, setAuthActionContext] = useState("");

  const requireAuth = (actionType) => {
    if (!authStatus) {
      setAuthActionContext(actionType);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleSaveToggle = async () => {
    if (!requireAuth("save")) return;
    setSaveLoading(true);
    try {
      setSaved((s) => !s);
      onToggleSave();
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.error("Save toggle failed", e);
      setSaved((s) => !s);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownload = async () => {};

  const handleShare = async () => {
    const payload = videoData?._id || id || "unknown-id";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const ta = document.createElement("textarea");
        ta.value = payload;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Unable to copy to clipboard");
    }
  };

  const onToggleDislike = () => {
    setDisliked(!disliked);
  };
  const onToggleSave = () => {
    setSaved(!saved);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const [subscribed, setSubscribed] = useState(false);
  const [subsCount, setSubsCount] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNowStrict(date, { addSuffix: true });
  };

  useEffect(() => {

    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`/api/v1/videos/videoData/${id}`);
        setVideoData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();

    if (id) {
      axios
        .get(`/api/v1/videos/${id}/like/status`)
        .then((res) => {
          setLiked(!!res.data.data?.liked);
          setLikesCount(res.data.data?.count || 0);
        })
        .catch(() => {});
    }
  }, [id]);

  const handleLikeToggle = async () => {
    if (!requireAuth("like")) return;
    if (!id) return;
    try {
      const res = await axios.put(`/api/v1/videos/${id}/like`);
      setLiked(!!res.data.data?.liked);
      setLikesCount(res.data.data?.count ?? (liked ? likesCount - 1 : likesCount + 1));
      if (disliked) setDisliked(false);
    } catch (e) {
      console.error("Like toggle failed", e);
    }
  };


  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let viewSent = false;
    const handler = async () => {
      if (viewSent) return;
      if (!el.currentTime || el.currentTime < 3) return;
      viewSent = true;
      try {
        await axios.put(`/api/v1/videos/incrementView/${id}`);
        setVideoData((prev) =>
          prev ? { ...prev, views: (prev.views || 0) + 1 } : prev
        );
        await axios.put(`/api/v1/account/addToHistory/${id}`);
      } catch (err) {
        console.error("View/watch update failed:", err);
      }
    };

    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, [id, loading]);

  useEffect(() => {
    if (videoData && videoData.owner) {
      const fetchUser = async () => {
        try {
          const channelId =
            typeof videoData.owner === "object"
              ? videoData.owner._id
              : videoData.owner;

          const response = await axios.get(
            `/api/v1/account/userData/${channelId}`
          );
          setUserData(response.data.data);
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

  if (loading) {
    return (
      <PageContainer>
        <div className="w-full aspect-video bg-gray-200/60 dark:bg-gray-800/60 rounded-2xl animate-shimmer mb-4" />
        <div className="h-6 bg-gray-200/60 dark:bg-gray-800/60 rounded w-2/3 mb-2 animate-shimmer" />
      </PageContainer>
    );
  }

  if (error || !videoData) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/30 rounded-2xl border border-red-200 dark:border-red-800/30 my-4">
          {error || "No video data found."}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Primary Video Player & Channel Info Column */}
        <div className="lg:col-span-8">
          {/* Video Container (aspect-video, full bleed on mobile) */}
          <div 
            className="relative w-auto sm:w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-lg -mx-3 sm:mx-0"
            style={{ viewTransitionName: `video-thumbnail-${id}` }}
          >
            {(() => {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
              let finalVideoSrc = "";
              if (typeof videoData.videoFile === "string" && videoData.videoFile.includes("/temp/")) {
                const parts = videoData.videoFile.split("/");
                const filename = parts[parts.length - 1];
                finalVideoSrc = `${baseUrl}/api/v1/videos/stream/${encodeURIComponent(filename)}`;
              } else if (typeof videoData.videoFile === "string") {
                finalVideoSrc = /^https?:\/\//i.test(videoData.videoFile)
                  ? videoData.videoFile
                  : videoData.videoFile.startsWith("/")
                  ? `${baseUrl}${videoData.videoFile}`
                  : `${baseUrl}/${videoData.videoFile}`;
              }

              return (
                <video
                  key={finalVideoSrc}
                  ref={videoRef}
                  src={finalVideoSrc}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              );
            })()}
          </div>


          {/* Title & Metadata */}
          <div className="mt-3 sm:mt-4 px-4 sm:px-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {videoData.title}
            </h1>

            {/* Channel Info & Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-3 border-b border-gray-200 dark:border-gray-800">
              {/* Channel Profile */}
              {userData && (
                <div className="flex items-center space-x-3 min-w-0">
                  <Link to={`/channel/${userData._id}`}>
                    <img
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      src={userData.avatar}
                      alt={userData.name}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/channel/${userData._id}`} className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate block hover:underline">
                      {userData.name}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {subsCount} subscribers
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!requireAuth("subscribe")) return;
                      try {
                        const channelId =
                          videoData?.owner &&
                          typeof videoData.owner === "object"
                            ? videoData.owner._id
                            : videoData?.owner;

                        const res = await axios.put(
                          `/api/v1/account/subscribe/${encodeURIComponent(
                            channelId
                          )}`
                        );
                        setSubscribed(res.data.data.subscribed);
                        setSubsCount(res.data.data.count);
                      } catch (e) {
                        console.error("Subscribe toggle failed:", e);
                      }
                    }}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors flex-shrink-0 min-h-[44px] ${
                      subscribed
                        ? "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    }`}
                  >
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              )}

              {/* Action Buttons (Like, Dislike, Share, Save) */}
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1 flex-shrink-0">
                {/* Like / Dislike Combined Segmented Pill */}
                <div className="inline-flex items-center bg-gray-100 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-full h-9 transition-colors flex-shrink-0 shadow-2xs">
                  <button
                    onClick={handleLikeToggle}
                    className={`inline-flex items-center space-x-1.5 px-3.5 h-full rounded-l-full text-xs font-medium transition-all duration-200 group ${
                      liked ? "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                    title="Like video"
                  >
                    {liked ? (
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    ) : (
                      <LineDrawIcon
                        path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        className="w-4 h-4"
                        baseColor="text-gray-600 dark:text-gray-400"
                        activeColor="text-gray-900 dark:text-gray-100"
                        strokeWidth={1.75}
                      />
                    )}
                    <span>{likesCount}</span>
                  </button>

                  <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 flex-shrink-0" />

                  <button
                    onClick={() => {
                      if (!requireAuth("like")) return;
                      setLiked(false);
                      setDisliked(!disliked);
                    }}
                    className={`inline-flex items-center px-3 h-full rounded-r-full text-xs font-medium transition-all duration-200 group ${
                      disliked ? "text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/30 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                    title="Dislike video"
                  >
                    {disliked ? (
                      <svg className="w-4 h-4 transform rotate-180 text-red-600 dark:text-red-400 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    ) : (
                      <div className="transform rotate-180">
                        <LineDrawIcon
                          path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          className="w-4 h-4"
                          baseColor="text-gray-600 dark:text-gray-400"
                          activeColor="text-gray-900 dark:text-gray-100"
                          strokeWidth={1.75}
                        />
                      </div>
                    )}
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center space-x-1.5 px-3.5 h-9 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-800/80 text-gray-700 dark:text-gray-300 transition-all duration-200 flex-shrink-0 shadow-2xs group"
                >
                  <LineDrawIcon
                    path="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    className="w-4 h-4"
                    baseColor="text-gray-600 dark:text-gray-400"
                    activeColor="text-gray-900 dark:text-gray-100"
                    strokeWidth={1.75}
                  />
                  <span>{shareCopied ? "Copied!" : "Share"}</span>
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`inline-flex items-center space-x-1.5 px-3.5 h-9 rounded-full text-xs font-medium border border-gray-200/80 dark:border-gray-800/80 transition-all duration-200 flex-shrink-0 shadow-2xs group ${
                    saved ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 font-semibold" : "bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {saved ? (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors" fill="currentColor" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  ) : (
                    <LineDrawIcon
                      path="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      className="w-4 h-4"
                      baseColor="text-gray-600 dark:text-gray-400"
                      activeColor="text-gray-900 dark:text-gray-100"
                      strokeWidth={1.75}
                    />
                  )}
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>


            </div>

            {/* Description Card */}
            <div
              onClick={handleToggle}
              className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl cursor-pointer hover:bg-gray-200/80 dark:hover:bg-gray-800/80 transition-colors text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
            >
              <div className="flex items-center space-x-2 font-semibold text-gray-900 dark:text-gray-100 mb-1">
                <span>{videoData.views || 0} views</span>
                <span>•</span>
                <span>{formatDate(videoData.createdAt)}</span>
              </div>
              <p className={isExpanded ? "" : "line-clamp-2"}>
                {videoData.description || "No description provided."}
              </p>
              <span className="text-blue-600 dark:text-blue-400 font-semibold mt-1 inline-block">
                {isExpanded ? "Show less" : "...more"}
              </span>
            </div>

            {/* Comments Component */}
            <div className="mt-6">
              <Comments videoId={id} onRequireAuth={() => requireAuth("comment")} />
            </div>
          </div>
        </div>

        {/* Sidebar / Recommended Videos Stack */}
        <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-4 px-4 sm:px-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Related Content</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
            More videos from {userData?.name || "this channel"} will appear here.
          </div>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        actionType={authActionContext} 
      />
    </PageContainer>
  );
}

export default Video;
