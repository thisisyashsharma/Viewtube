import React from "react";
import { Link } from "react-router-dom";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function VideoCard({ video }) {
  return (
    <div className="w-72 cursor-pointer">
      {/* Thumbnail with duration */}
      <Link to={`/watch/${video._id}`}>
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="rounded-lg w-full object-cover"
            onError={(e) => {
              // Prevent infinite loop
              if (!e.currentTarget.dataset.fallbackApplied) {
                const randomIndex = Math.floor(Math.random() * 12) + 1; // 1–8
                e.currentTarget.src = `http://localhost:8000/placeholders/loading${randomIndex}.gif`;
                e.currentTarget.dataset.fallbackApplied = "true";
              }
            }}
          />
          <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>

      {/* Channel avatar + details */}
      <div className="flex mt-2 gap-2">
        <img
          src={video?.owner?.avatar}
          alt={video?.owner?.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold truncate">{video.title}</h3>
          <p className="text-sm text-gray-600 truncate">{video?.owner?.name}</p>
          <p className="text-sm text-gray-500">{video.views} views</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
