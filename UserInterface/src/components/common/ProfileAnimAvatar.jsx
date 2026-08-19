import React, { useState } from "react";
import { getThumbnailUrl } from "../../utils/thumbnail.utils";

/**
 * Reusable Profile Animation Avatar Component
 * Supports all 10 minimalist zero-scaling micro-animations with 100% concentric precision
 */
function ProfileAnimAvatar({
  avatar,
  userInitial = "Y",
  animIndex = 0,
  isActive = false,
  isHovered = false,
  forceAnimate = false,
  className = "",
  size = "w-7 h-7",
}) {
  const [imgError, setImgError] = useState(false);
  const showAnim = animIndex >= 0 && (forceAnimate || isHovered || isActive);
  const resolvedAvatar = !imgError && avatar ? getThumbnailUrl(avatar) : null;
  const isImageValid = resolvedAvatar && !resolvedAvatar.includes("data:image/svg+xml");

  return (
    <div className={`relative ${size} flex items-center justify-center ${className}`}>
      {/* Style 1 (idx 0): Conic Orbit Halo */}
      {animIndex === 0 && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+6px)] h-[calc(100%+6px)] rounded-full overflow-hidden pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full h-full animate-border-beam rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,theme(colors.gray.900)_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_300deg,theme(colors.white)_360deg)]" />
        </div>
      )}

      {/* Style 2 (idx 1): Dual-Orbit Binary Pulsar (Twin Orbiting Satellites) */}
      {animIndex === 1 && (
        <div
          className={`absolute -inset-1 rounded-full pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100 animate-spin" : "opacity-0"
          }`}
          style={{ animationDuration: "2.4s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white shadow-xs" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white shadow-xs" />
        </div>
      )}

      {/* Style 4 (idx 3): Cinematic Spotlight Intro Dual Arcs (Top & Bottom Reveal) */}
      {animIndex === 3 && (
        <div
          className={`absolute -inset-[3px] pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full h-full rounded-full border-2 border-transparent border-t-gray-950 border-b-gray-950 dark:border-t-white dark:border-b-white animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      )}

      {/* Style 6 (idx 5): Modern Diamond Corner Accents (4 Cardinal Pip Trackers) */}
      {animIndex === 5 && (
        <div
          className={`absolute -inset-1.5 rounded-full pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100 animate-spin" : "opacity-0"
          }`}
          style={{ animationDuration: "5s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
        </div>
      )}

      {/* Style 7 (idx 6): Neon Pulse Glow Frame */}
      {animIndex === 6 && (
        <div
          className={`absolute -inset-1 rounded-full bg-blue-500/30 dark:bg-blue-400/20 blur-xs transition-opacity duration-300 pointer-events-none ${
            showAnim ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
        />
      )}

      {/* Style 10 (idx 9): Precision Gyroscopic Compass Ring (Animated Dual Dashes) */}
      {animIndex === 9 && (
        <svg
          className={`absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] text-gray-900 dark:text-gray-100 pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
          viewBox="0 0 36 36"
          fill="none"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            stroke="currentColor"
            strokeWidth="2"
            className={showAnim ? "animate-ring-trace" : ""}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Base Avatar Image or Letter Initial */}
      {isImageValid ? (
        <div className={`relative ${size} rounded-full overflow-hidden shrink-0`}>
          <img
            src={resolvedAvatar}
            alt="User Avatar"
            onError={() => setImgError(true)}
            className={`${size} rounded-full object-cover border transition-colors duration-200 ${
              isActive
                ? "border-gray-900 dark:border-gray-100 ring-2 ring-gray-900/20 dark:ring-gray-100/30"
                : "border-gray-300 dark:border-gray-700"
            }`}
          />
          {/* Style 3 (idx 2): Lens Glass Shimmer Sheen */}
          {animIndex === 2 && (
            <div
              className={`absolute inset-0 animate-mask-shimmer bg-white/30 pointer-events-none transition-opacity duration-200 ${
                showAnim ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {/* Style 8 (idx 7): Biometric Laser Scan Line */}
          {animIndex === 7 && (
            <div
              className={`absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gray-900 dark:via-white to-transparent animate-laser-scan pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${
                showAnim ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      ) : (
        <div className={`relative ${size} rounded-full overflow-hidden shrink-0`}>
          <div
            className={`${size} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-2xs ${
              isActive ? "ring-2 ring-blue-400/50" : ""
            }`}
          >
            {userInitial}
          </div>
          {/* Style 3 (idx 2): Lens Glass Shimmer Sheen */}
          {animIndex === 2 && (
            <div
              className={`absolute inset-0 animate-mask-shimmer bg-white/30 pointer-events-none transition-opacity duration-200 ${
                showAnim ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {/* Style 8 (idx 7): Biometric Laser Scan Line */}
          {animIndex === 7 && (
            <div
              className={`absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent animate-laser-scan pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-opacity duration-200 ${
                showAnim ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      )}

      {/* Style 5 (idx 4): Creator Spark Halo (3 Sparks above avatar) */}
      {animIndex === 4 && (
        <div
          className={`absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 transition-all duration-300 pointer-events-none ${
            showAnim ? "opacity-100 -translate-y-1 animate-pulse" : "opacity-0"
          }`}
        >
          <div className="w-1 h-1 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white -translate-y-0.5 shadow-xs" />
          <div className="w-1 h-1 rounded-full bg-gray-900 dark:bg-white shadow-xs" />
        </div>
      )}

      {/* Style 9 (idx 8): Studio Equalizer Wave Bars */}
      {animIndex === 8 && (
        <div
          className={`absolute -bottom-0.5 -right-1 flex items-end gap-[1.5px] p-0.5 rounded bg-white/90 dark:bg-[#0f0f0f]/90 transition-opacity duration-200 pointer-events-none ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-[2px] bg-gray-950 dark:bg-white rounded-full animate-eq-1" />
          <div className="w-[2px] bg-gray-950 dark:bg-white rounded-full animate-eq-2" />
          <div className="w-[2px] bg-gray-950 dark:bg-white rounded-full animate-eq-3" />
        </div>
      )}

      {/* Emerald Dot for Style 1 (idx 0) */}
      {animIndex === 0 && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f0f0f] transition-opacity duration-200 pointer-events-none ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      )}
    </div>
  );
}

export default ProfileAnimAvatar;
