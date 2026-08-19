import React, { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggleButton({ className = "", compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [animKey, setAnimKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null); // 'to-dark' | 'to-light'
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    e?.preventDefault?.();
    const nextTheme = isDark ? "light" : "dark";
    const dir = isDark ? "to-light" : "to-dark";
    setTransitionDirection(dir);
    setAnimKey((prev) => prev + 1);
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 600);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      y: rect.top + rect.height / 2;
      const y = rect.top + rect.height / 2;
      toggleTheme({ x, y });
    } else {
      toggleTheme(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-gray-100 dark:bg-[#202020] text-gray-950 dark:text-white font-semibold text-xs sm:text-sm border border-gray-300 dark:border-white/10 hover:bg-gray-200/90 dark:hover:bg-[#282828] hover:border-gray-400 dark:hover:border-white/25 transition-all duration-300 min-h-[38px] cursor-pointer shadow-2xs overflow-visible active:translate-y-[0.5px] group select-none ${className}`}
      style={
        isTransitioning
          ? {
              boxShadow:
                transitionDirection === "to-dark"
                  ? "0 0 20px rgba(255, 255, 255, 0.25)"
                  : "0 0 16px rgba(0, 0, 0, 0.15)",
              transition: "box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }
          : {}
      }
    >
      {/* 45-Degree Laser Sheen Glint (Strictly confined inside overflow-hidden capsule) */}
      <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden" aria-hidden="true">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100" />
      </span>

      {/* ── 1. Cosmic Solar Flare (8 Radial Photon Beams when switching to Light) ── */}
      {isTransitioning && transitionDirection === "to-light" && (
        <div
          key={`flare-${animKey}`}
          className="pointer-events-none absolute inset-0 z-30"
          aria-hidden="true"
        >
          {/* N */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-900 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamN 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* NE */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamNE 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* E */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-900 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamE 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* SE */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamSE 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* S */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-900 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamS 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* SW */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamSW 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* W */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-900 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamW 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          {/* NW */}
          <span
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-800 shadow-[0_0_4px_rgba(0,0,0,0.8)]"
            style={{ animation: "vtBeamNW 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
        </div>
      )}

      {/* ── 2. Twilight Eclipse Starlight (Constellation Glints when switching to Dark) ── */}
      {isTransitioning && transitionDirection === "to-dark" && (
        <div
          key={`twilight-${animKey}`}
          className="pointer-events-none absolute inset-0 z-30"
          aria-hidden="true"
        >
          <span
            className="absolute top-1 left-2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            style={{ animation: "vtSparkTL 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute top-1 right-3 w-1 h-1 rounded-full bg-gray-200 shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            style={{ animation: "vtSparkTR 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute bottom-1 left-3 w-1 h-1 rounded-full bg-gray-300 shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            style={{ animation: "vtSparkBL 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute bottom-1 right-2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            style={{ animation: "vtSparkBR 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
        </div>
      )}

      {/* High-Contrast B&W Celestial Dual-Layer Icon Container */}
      <span className="relative w-[18px] h-[18px] sm:w-5 sm:h-5 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
        {/* Moon Layer */}
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg)" : "rotate(-90deg)",
            pointerEvents: "none",
          }}
        >
          <svg
            className="w-[18px] h-[18px] text-white shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>

        {/* Sun Layer */}
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(90deg)" : "rotate(0deg)",
            pointerEvents: "none",
          }}
        >
          <svg
            className="w-[18px] h-[18px] text-gray-950 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
            <path
              strokeLinecap="round"
              d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        </span>
      </span>

      {/* Slide-Morph Typography */}
      <span className="relative h-4 sm:h-5 flex items-center overflow-hidden font-semibold">
        <span
          className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDark
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 absolute pointer-events-none"
          }`}
        >
          {compact ? "Dark" : "Dark mode"}
        </span>
        <span
          className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDark
              ? "translate-y-full opacity-0 absolute pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
        >
          {compact ? "Light" : "Light mode"}
        </span>
      </span>

      <style>{`
        /* 8-Axis Radial Photon Beams (Zero-Scale) */
        @keyframes vtBeamN {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, calc(-50% - 18px)); }
        }
        @keyframes vtBeamNE {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% + 14px), calc(-50% - 14px)); }
        }
        @keyframes vtBeamE {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% + 18px), -50%); }
        }
        @keyframes vtBeamSE {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% + 14px), calc(-50% + 14px)); }
        }
        @keyframes vtBeamS {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, calc(-50% + 18px)); }
        }
        @keyframes vtBeamSW {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% - 14px), calc(-50% + 14px)); }
        }
        @keyframes vtBeamW {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% - 18px), -50%); }
        }
        @keyframes vtBeamNW {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(calc(-50% - 14px), calc(-50% - 14px)); }
        }

        /* Twilight Starlight Glints */
        @keyframes vtSparkTL {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(-14px, -12px); }
        }
        @keyframes vtSparkTR {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(14px, -12px); }
        }
        @keyframes vtSparkBL {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(-14px, 12px); }
        }
        @keyframes vtSparkBR {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(14px, 12px); }
        }
      `}</style>
    </button>
  );
}
