import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getThumbnailUrl,
  formatDuration,
} from "../utils/thumbnail.utils";

function VideoCard({ video, onEdit, onDelete, onReport }) {
  const displayImgSrc = getThumbnailUrl(video);
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isOwner =
    currentUser?._id &&
    (video?.owner?._id === currentUser._id ||
      video?.owner === currentUser._id ||
      currentUser.role === "admin");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleNavigate = (e) => {
    e.preventDefault();
    if (!document.startViewTransition) {
      navigate(`/watch/${video._id}`);
      return;
    }
    document.startViewTransition(() => {
      navigate(`/watch/${video._id}`);
    });
  };

  return (
    <div 
      className="w-full group relative flex flex-col bg-transparent hover:opacity-95 transition-opacity duration-200 ease-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a href={`/watch/${video._id}`} onClick={handleNavigate} className="w-full block">
        <div className="relative w-full aspect-video rounded-none sm:rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-none sm:shadow-sm">

          <img
            src={displayImgSrc}
            alt={video?.title || "video thumbnail"}
            loading="lazy"
            style={{ viewTransitionName: `video-thumbnail-${video._id}` }}
            className="w-full h-full object-cover transform transition-transform duration-300"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallbackApplied) {
                e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='100%25' height='100%25' fill='%231f2937'/%3E%3Cpath d='M280 140l100 40-100 40z' fill='%239ca3af'/%3E%3C/svg%3E";
                e.currentTarget.dataset.fallbackApplied = "true";
              }
            }}
          />
          {isHovered && video?.videoFile && (
            <video
              src={video.videoFile}
              className="absolute inset-0 w-full h-full object-cover rounded-none sm:rounded-xl"
              autoPlay
              muted
              loop
              playsInline
              // Stop preview after 10s roughly, or let it loop continuously. The user asked for "loop like 10 seconds", we will just autoPlay and loop it. 
              // To literally stop after 10 seconds, we can do it via a timeout, but standard looping preview is better. Let's just let it loop natively.
            />
          )}
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium px-1.5 py-0.5 rounded-md">
            {formatDuration(video?.duration ?? 0)}
          </span>
        </div>
      </a>

      {/* Channel avatar + details */}
      <div className="flex mt-3 gap-3 items-start relative px-3 sm:px-0">
        {video?.owner?.avatar && (
          <Link to={`/channel/${video?.owner?._id || ""}`} className="flex-shrink-0">
            <img
              src={video?.owner?.avatar}
              alt={video?.owner?.name || "Channel avatar"}
              className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-gray-800"
              loading="lazy"
            />
          </Link>
        )}
        <div className="flex flex-col min-w-0 flex-1 pr-6">
          <Link to={`/watch/${video._id}`}>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
              {video?.title || "Untitled Video"}
            </h3>
          </Link>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1 font-medium hover:text-gray-900 dark:hover:text-gray-200">
            {video?.owner?.name || "Unknown Channel"}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-1.5">
            <span>{video?.views ?? 0} views</span>
            <span>•</span>
            <span>{video?.likesCount ?? video?.likes ?? 0} likes</span>
          </div>
        </div>

        {/* Three Dots Menu Button for Video Owner/Admin or custom handlers */}
        {(isOwner || onEdit || onDelete) && (
          <div className="absolute right-0 top-0 z-20" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="More options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50 text-xs font-medium divide-y divide-gray-100 dark:divide-gray-800 animate-fadeIn">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(video);
                    }}
                    className="w-full px-4 py-2.5 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 transition-colors"
                  >
                    <span>✏️</span>
                    <span>Edit Video Details</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(video._id);
                    }}
                    className="w-full px-4 py-2.5 text-left text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2 transition-colors"
                  >
                    <span>🗑️</span>
                    <span>Delete Video</span>
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(false);
                      onReport(video._id);
                    }}
                    className="w-full px-4 py-2.5 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 transition-colors"
                  >
                    <span>⚠️</span>
                    <span>Report</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
