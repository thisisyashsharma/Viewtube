import React from "react";
import { Link } from "react-router-dom";
import {
  getThumbnailUrl,
  getPosterFromVideo,
  formatDuration,
} from "../utils/thumbnail.utils";

// EU12u2.p2.a2 - Thumbnail Fix (minimal, uses shared utils)

 

function VideoCard({ video }) {
  // Use the shared helper — it will return a proper URL or the no-thumbnail fallback.
  const displayImgSrc = getThumbnailUrl(video);

  return (
    <div className="w-72 cursor-pointer bg-gray-100">
      <Link to={`/watch/${video._id}`}>
        <div className="relative">
          {/* Responsive 16:9 thumbnail container */}
          <div
            className="w-full rounded-lg bg-gray-100 overflow-hidden"
            style={{ paddingTop: "56.25%", position: "relative" }} // 16:9 aspect ratio
          >
            <img
              src={displayImgSrc}
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
                // fixed fallback: single specific image (no randomness)
                if (!e.currentTarget.dataset.fallbackApplied) {
                  e.currentTarget.src = "http://localhost:8000/placeholders/noThumbnail.png";
                  e.currentTarget.dataset.fallbackApplied = "true";
                }
              }}
            />
            <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
              {formatDuration(video?.duration ?? 0)}
            </span>
          </div>
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
