import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useRef } from "react"; //EU6u1.p2.a1.1ln - Views Increment - updated one lines to target exact video elements
import Comments from "./Comments";
import SubscribeButton from "./SubscribeButton";
import { formatDistanceToNowStrict } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import AuthPromptModal from "./common/AuthPromptModal";
import { LineDrawIcon, RollingCounter } from "./common";

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
  const [avatarCelebration, setAvatarCelebration] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [likeAnimKey, setLikeAnimKey] = useState(0);
  const [showLikeFloater, setShowLikeFloater] = useState(false);
  const [showLikeSparks, setShowLikeSparks] = useState(false);
  const [dislikeAnimKey, setDislikeAnimKey] = useState(0);
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
      const isNowLiked = !!res.data.data?.liked;
      setLiked(isNowLiked);
      setLikesCount(res.data.data?.count ?? (liked ? likesCount - 1 : likesCount + 1));
      if (disliked) setDisliked(false);

      if (isNowLiked) {
        setLikeAnimKey((k) => k + 1);
        setShowLikeFloater(true);
        setShowLikeSparks(true);
        setTimeout(() => setShowLikeFloater(false), 950);
        setTimeout(() => setShowLikeSparks(false), 600);
      }
    } catch (e) {
      console.error("Like toggle failed", e);
    }
  };

  const handleDislikeToggle = () => {
    if (!requireAuth("like")) return;
    setLiked(false);
    const newDisliked = !disliked;
    setDisliked(newDisliked);
    if (newDisliked) {
      setDislikeAnimKey((k) => k + 1);
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
            `/api/v1/account/subscribe/status/${channelId}`
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
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Primary Video Player & Channel Info Column */}
        <div className="lg:col-span-8">
          {/* Video Container (aspect-video, full bleed on mobile) */}
          <div 
            className="relative w-auto sm:w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-lg -mx-4 -mt-3 sm:mx-0 sm:mt-0"
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
          <div className="mt-3 sm:mt-4 space-y-3">
            <h1 className="text-base sm:text-xl font-bold text-gray-950 dark:text-white leading-snug tracking-tight">
              {videoData.title}
            </h1>

            {/* Channel Info & Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3 border-b border-gray-100 dark:border-white/5">
              {/* Channel Profile */}
              {userData && (
                <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/channel/${userData._id}`} className="shrink-0 relative">
                      <img
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border transition-all duration-500 shadow-2xs ${
                          avatarCelebration
                            ? "border-blue-500 ring-2 ring-blue-500/70 shadow-[0_0_16px_rgba(59,130,246,0.6)]"
                            : "border-gray-200 dark:border-white/10"
                        }`}
                        src={userData.avatar}
                        alt={userData.name}
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/channel/${userData._id}`} className="font-bold text-sm sm:text-base text-gray-950 dark:text-white truncate block hover:text-blue-600 transition-colors leading-tight">
                        {userData.name}
                      </Link>
                      <span className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium inline-flex items-center gap-1.5 mt-0.5">
                        <RollingCounter value={subsCount ?? 0} className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-[13px]" />
                        <span>subscribers</span>
                      </span>
                    </div>
                  </div>

                  <SubscribeButton
                    channelId={
                      videoData?.owner && typeof videoData.owner === "object"
                        ? videoData.owner._id
                        : videoData?.owner
                    }
                    subscribed={subscribed}
                    subsCount={subsCount}
                    onRequireAuth={() => requireAuth("subscribe")}
                    onChange={(newSub, newCount) => {
                      setSubscribed(newSub);
                      setSubsCount(newCount);
                      if (newSub) {
                        setAvatarCelebration(true);
                        setTimeout(() => setAvatarCelebration(false), 850);
                      }
                    }}
                  />
                </div>
              )}

              {/* Action Buttons (Like, Dislike, Share, Save) */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 shrink-0">
                {/* Like / Dislike Combined Segmented Pill */}
                <div className="relative inline-flex items-center bg-gray-100 dark:bg-[#1f1f1f] border border-gray-200/80 dark:border-white/10 rounded-full h-9 sm:h-10 transition-colors shrink-0 shadow-2xs">
                  {/* Floating Like +1 Floater */}
                  {showLikeFloater && (
                    <span
                      key={`like-floater-${likeAnimKey}`}
                      className="pointer-events-none absolute -top-3.5 left-2 z-30 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 bg-white/95 dark:bg-[#181818]/95 shadow-[0_4px_12px_rgba(37,99,235,0.25)] border border-blue-500/30 backdrop-blur-md select-none"
                      style={{
                        animation: "vtPopAndFloat 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                      }}
                    >
                      <span className="leading-none tracking-tight">+1</span>
                    </span>
                  )}

                  {/* Micro Like Sparks */}
                  {showLikeSparks && (
                    <div key={`like-sparks-${likeAnimKey}`} className="pointer-events-none absolute inset-0 z-20">
                      <span
                        className="absolute top-1 left-2 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]"
                        style={{ animation: "vtSparkTL 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                      />
                      <span
                        className="absolute top-1 left-5 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]"
                        style={{ animation: "vtSparkTR 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                      />
                      <span
                        className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_4px_#818cf8]"
                        style={{ animation: "vtSparkBL 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                      />
                    </div>
                  )}

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={handleLikeToggle}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 h-full rounded-l-full text-xs sm:text-[13px] font-semibold transition-all duration-200 active:translate-y-[0.5px] cursor-pointer ${
                      liked
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-900/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-[#282828]"
                    }`}
                    title="Like video"
                  >
                    <span
                      key={`like-icon-${likeAnimKey}`}
                      className="flex items-center justify-center"
                      style={
                        liked && likeAnimKey > 0
                          ? { animation: "vtThumbKick 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards" }
                          : {}
                      }
                    >
                      <svg
                        className="w-[19px] h-[19px] sm:w-5 sm:h-5 shrink-0"
                        fill={liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={liked ? 0 : 2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                    </span>
                    <RollingCounter value={likesCount} className="font-semibold text-xs sm:text-[13px]" />
                  </button>

                  <div className="h-4.5 w-[1px] bg-gray-300 dark:bg-white/15 shrink-0" />

                  {/* Dislike Button */}
                  <button
                    type="button"
                    onClick={handleDislikeToggle}
                    className={`inline-flex items-center px-3 sm:px-3.5 h-full rounded-r-full text-xs sm:text-[13px] font-semibold transition-all duration-200 active:translate-y-[0.5px] cursor-pointer ${
                      disliked
                        ? "text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-900/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-[#282828]"
                    }`}
                    title="Dislike video"
                  >
                    <span
                      key={`dislike-icon-${dislikeAnimKey}`}
                      className="flex items-center justify-center"
                      style={
                        disliked && dislikeAnimKey > 0
                          ? { animation: "vtDislikeTilt 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }
                          : {}
                      }
                    >
                      <svg
                        className="w-[19px] h-[19px] sm:w-5 sm:h-5 rotate-180 shrink-0"
                        fill={disliked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={disliked ? 0 : 2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                <style>{`
                  @keyframes vtThumbKick {
                    0% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-3px) rotate(-16deg); }
                    60% { transform: translateY(1px) rotate(4deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                  }
                  @keyframes vtDislikeTilt {
                    0% { transform: translateY(0) rotate(180deg); }
                    35% { transform: translateY(3px) rotate(196deg); }
                    100% { transform: translateY(0) rotate(180deg); }
                  }
                `}</style>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 h-9 sm:h-10 rounded-full text-xs sm:text-[13px] font-semibold bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200/80 dark:hover:bg-[#282828] border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 transition-colors shrink-0 shadow-2xs cursor-pointer active:translate-y-[0.5px]"
                >
                  {shareCopied ? (
                    <>
                      <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600 dark:text-green-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 h-9 sm:h-10 rounded-full text-xs sm:text-[13px] font-semibold border transition-colors shrink-0 shadow-2xs cursor-pointer active:translate-y-[0.5px] ${
                    saved
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30 font-bold"
                      : "bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200/80 dark:hover:bg-[#282828] border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 shrink-0" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={saved ? 0 : 2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>{saved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div
              onClick={handleToggle}
              className="mt-3 p-3.5 sm:p-4 bg-gray-100/90 dark:bg-[#161616] rounded-2xl border border-gray-200/80 dark:border-white/5 cursor-pointer hover:bg-gray-200/70 dark:hover:bg-[#1d1d1d] transition-colors text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-2xs"
            >
              <div className="flex items-center gap-2 font-bold text-gray-950 dark:text-white mb-1.5 text-xs">
                <span>{(videoData.views || 0).toLocaleString()} views</span>
                <span>•</span>
                <span>{formatDate(videoData.createdAt)}</span>
              </div>
              <p className={`whitespace-pre-line text-gray-700 dark:text-gray-300 ${isExpanded ? "" : "line-clamp-2"}`}>
                {videoData.description || "No description provided."}
              </p>
              <div className="mt-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                {isExpanded ? "Show less" : "...more"}
              </div>
            </div>

            {/* Comments Component */}
            <div className="mt-6">
              <Comments videoId={id} onRequireAuth={() => requireAuth("comment")} />
            </div>
          </div>
        </div>

        {/* Sidebar / Recommended Videos Stack */}
        <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white tracking-tight">
            Related Content
          </h2>
          <div className="p-6 bg-gray-50 dark:bg-[#141414] rounded-2xl border border-gray-200/80 dark:border-white/5 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            More videos from <span className="font-semibold text-gray-800 dark:text-gray-200">{userData?.name || "this channel"}</span> will appear here.
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
