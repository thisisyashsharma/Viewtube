import React from "react";

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
  const showAnim = animIndex >= 0 && (forceAnimate || isHovered || isActive);

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
          <svg
            className="absolute inset-0 w-full h-full text-blue-600 dark:text-blue-400"
            viewBox="0 0 36 36"
            fill="none"
          >
            {/* Right Hemisphere Beam Arc */}
            <path
              d="M18 2 A16 16 0 0 1 18 34"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={showAnim ? "animate-intro-arc-1" : ""}
            />
            {/* Left Hemisphere Beam Arc */}
            <path
              d="M18 2 A16 16 0 0 0 18 34"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={showAnim ? "animate-intro-arc-2" : ""}
            />
          </svg>
          {/* Top & Bottom Accent Beacon Dots */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white shadow-xs" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white shadow-xs" />
        </div>
      )}

      {/* Style 6 (idx 5): Smooth Dual-Track Aurora Halo (Counter-Rotating Glass Halo) */}
      {animIndex === 5 && (
        <div
          className={`absolute -inset-[3px] pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Outer Ring - Clockwise Smooth Spin */}
          <svg
            className="absolute inset-0 w-full h-full text-gray-900 dark:text-white animate-spin"
            style={{ animationDuration: "3s" }}
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeDasharray="28 28"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
          {/* Inner Counter-Ring - Counter-Clockwise Silky Spin */}
          <svg
            className="absolute inset-0 w-full h-full text-blue-600 dark:text-blue-400 animate-spin-reverse"
            style={{ animationDuration: "4.5s" }}
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeDasharray="16 20"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>
      )}

      {/* Style 7 (idx 6): Single Orbiting Satellite Dot */}
      {animIndex === 6 && (
        <div
          className={`absolute -inset-1 rounded-full pointer-events-none transition-opacity duration-300 ${
            showAnim ? "opacity-100 animate-spin" : "opacity-0"
          }`}
          style={{ animationDuration: "2s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white shadow-xs" />
        </div>
      )}

      {/* Style 10 (idx 9): 360° Dynamic Ring Trace */}
      {animIndex === 9 && (
        <svg
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+6px)] h-[calc(100%+6px)] text-gray-900 dark:text-white pointer-events-none transition-opacity duration-300 ${
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
      {avatar ? (
        <div className={`relative ${size} rounded-full overflow-hidden flex-shrink-0`}>
          <img
            src={avatar}
            alt="User Avatar"
            className={`${size} rounded-full object-cover border transition-all duration-200 ${
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
        <div className={`relative ${size} rounded-full overflow-hidden flex-shrink-0`}>
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
            showAnim ? "opacity-100 -translate-y-1" : "opacity-0"
          }`}
        >
          <div className="w-1 h-1 rounded-full bg-gray-900 dark:bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-950 dark:bg-white -translate-y-0.5" />
          <div className="w-1 h-1 rounded-full bg-gray-900 dark:bg-white" />
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
