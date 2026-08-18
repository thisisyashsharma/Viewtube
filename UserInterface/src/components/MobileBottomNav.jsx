import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { LineDrawIcon, PrismText, ProfileAnimAvatar } from "./common";

function MobileBottomNav({ isDrawerOpen = false, onToggleDrawer }) {
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);

  const path = location.pathname;

  const isHomeActive = !isDrawerOpen && (path === "/" || path === "/home");
  const isMenuActive = isDrawerOpen;
  const isSubsActive = !isDrawerOpen && path === "/subscriptions";
  const isYouActive = !isDrawerOpen && path.startsWith("/your_channel") && path !== "/your_channel/upload_video";

  // Animation setting preference ('random' | 'off' | '0'..'9')
  const [animSetting, setAnimSetting] = useState(() => {
    return localStorage.getItem("viewtube_profile_anim_mode") || "random";
  });

  const [activeAnimIndex, setActiveAnimIndex] = useState(() => {
    const saved = localStorage.getItem("viewtube_profile_anim_mode") || "random";
    if (saved === "off") return -1;
    if (saved === "random") return Math.floor(Math.random() * 10);
    return Number(saved);
  });

  const [isProfileHovered, setIsProfileHovered] = useState(false);

  // Listen for setting changes across tabs & components
  useEffect(() => {
    const handleAnimChange = (e) => {
      const newMode = e.detail || localStorage.getItem("viewtube_profile_anim_mode") || "random";
      setAnimSetting(newMode);
      if (newMode === "off") {
        setActiveAnimIndex(-1);
      } else if (newMode === "random") {
        setActiveAnimIndex(Math.floor(Math.random() * 10));
      } else {
        setActiveAnimIndex(Number(newMode));
      }
    };

    window.addEventListener("viewtube_profile_anim_change", handleAnimChange);
    window.addEventListener("storage", handleAnimChange);

    return () => {
      window.removeEventListener("viewtube_profile_anim_change", handleAnimChange);
      window.removeEventListener("storage", handleAnimChange);
    };
  }, []);

  const handleProfileMouseEnter = () => {
    setIsProfileHovered(true);
    // If set to random, choose a new random animation on every hover!
    if (animSetting === "random") {
      setActiveAnimIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * 10);
        } while (next === prev);
        return next;
      });
    }
  };

  const handleProfileMouseLeave = () => {
    setIsProfileHovered(false);
  };

  // Get user initial if avatar not loaded
  const userInitial = (currentUser?.name || currentUser?.username || "Y")[0].toUpperCase();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-2xl border-t border-gray-200/70 dark:border-gray-800/70 h-[72px] px-1 flex items-center justify-around transition-colors duration-300 pb-[max(env(safe-area-inset-bottom),0.4rem)] shadow-2xl select-none">
      {/* 1. HOME */}
      <Link
        to="/home"
        className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 group ${
          isHomeActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        aria-label="Home"
      >
        {/* Material You Tonal Pill Container */}
        <div
          className={`w-[66px] h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isHomeActive
              ? "bg-gray-200/90 dark:bg-gray-800/90 text-gray-950 dark:text-white"
              : "bg-transparent text-gray-500 dark:text-gray-400 group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40"
          }`}
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg
              className={`w-[26px] h-[26px] transition-colors duration-200 overflow-visible ${
                isHomeActive
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Infinite Smoke Dots - Bigger & Straight Vertical Linear Path */}
              <circle
                cx="16"
                cy="3.5"
                r="1.35"
                fill="currentColor"
                stroke="none"
                className={`transition-opacity duration-300 ${
                  isHomeActive
                    ? "opacity-100 animate-smoke-rise"
                    : "opacity-0 group-hover:opacity-100 group-hover:animate-smoke-rise"
                }`}
              />
              <circle
                cx="16"
                cy="3.5"
                r="1.15"
                fill="currentColor"
                stroke="none"
                className={`transition-opacity duration-300 ${
                  isHomeActive
                    ? "opacity-100 animate-smoke-rise-2"
                    : "opacity-0 group-hover:opacity-100 group-hover:animate-smoke-rise-2"
                }`}
              />

              {/* Clean House Frame & Roof */}
              <path
                d="M3 10.5L12 3l9 7.5v9.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z"
                className="transition-all duration-300"
              />

              {/* Simple Centered Door (No fill) */}
              <path
                d="M9.5 21v-7a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v7"
                className="transition-all duration-300"
              />

              {/* Door Knob (Vanishes on hover / active) */}
              <circle
                cx="13.2"
                cy="17"
                r="0.85"
                fill="currentColor"
                stroke="none"
                className={`transition-opacity duration-200 ${
                  isHomeActive
                    ? "opacity-0"
                    : "opacity-100 group-hover:opacity-0"
                }`}
              />
            </svg>
          </div>
        </div>
        <PrismText
          text="Home"
          className="text-[11px] tracking-tight mt-0.5"
          baseColor={isHomeActive ? "font-bold text-gray-950 dark:text-white" : "font-medium text-gray-500 dark:text-gray-400"}
        />
      </Link>

      {/* 2. MENU (OPENS SIDEBAR DRAWER) */}
      <button
        type="button"
        onClick={onToggleDrawer}
        className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 group cursor-pointer ${
          isMenuActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        aria-label="Open Navigation Menu"
        title="Menu"
      >
        {/* Material You Tonal Pill Container */}
        <div
          className={`w-[66px] h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isMenuActive
              ? "bg-gray-200/90 dark:bg-gray-800/90 text-gray-950 dark:text-white"
              : "bg-transparent text-gray-500 dark:text-gray-400 group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40"
          }`}
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg
              className={`w-[26px] h-[26px] transition-colors duration-200 ${
                isMenuActive
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Top Line */}
              <line
                x1="3.5"
                y1="6"
                x2="20.5"
                y2="6"
                className="transition-transform duration-300 ease-out"
              />
              {/* Middle Line - Staggered slide animation on hover & active */}
              <line
                x1="3.5"
                y1="12"
                x2="14.5"
                y2="12"
                className={`transition-all duration-300 ease-out ${
                  isMenuActive
                    ? "translate-x-2 stroke-current"
                    : "group-hover:translate-x-2"
                }`}
              />
              {/* Bottom Line - Micro slide animation */}
              <line
                x1="3.5"
                y1="18"
                x2="18.5"
                y2="18"
                className={`transition-all duration-300 ease-out ${
                  isMenuActive
                    ? "translate-x-1 stroke-current"
                    : "group-hover:translate-x-1"
                }`}
              />
            </svg>
          </div>
        </div>
        <PrismText
          text="Menu"
          className="text-[11px] tracking-tight mt-0.5"
          baseColor={isMenuActive ? "font-bold text-gray-950 dark:text-white" : "font-medium text-gray-500 dark:text-gray-400"}
        />
      </button>

      {/* 3. CENTER PLUS / CREATE BUTTON */}
      <Link
        to="/your_channel/upload_video"
        className="relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 group text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        aria-label="Upload video"
        title="Upload or create"
      >
        <div className="w-[66px] h-9 rounded-full flex items-center justify-center transition-colors duration-200 bg-transparent group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40">
          <LineDrawIcon
            path="M12 4v16m8-8H4"
            className="w-[26px] h-[26px] transition-transform duration-300 group-hover:rotate-90 group-focus:rotate-90 group-active:rotate-90"
            baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white"
            activeColor="text-gray-950 dark:text-white"
            strokeWidth={2}
          />
        </div>
        <PrismText
          text="Create"
          className="text-[11px] tracking-tight mt-0.5"
          baseColor="font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
        />
      </Link>

      {/* 4. SUBSCRIPTIONS */}
      <Link
        to="/subscriptions"
        className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 group ${
          isSubsActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        aria-label="Subscriptions"
      >
        {/* Material You Tonal Pill Container */}
        <div
          className={`relative w-[66px] h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isSubsActive
              ? "bg-gray-200/90 dark:bg-gray-800/90 text-gray-950 dark:text-white"
              : "bg-transparent text-gray-500 dark:text-gray-400 group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40"
          }`}
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg
              className={`w-[26px] h-[26px] transition-colors duration-200 ${
                isSubsActive
                  ? "text-gray-950 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Top Tier (Narrow Arch) - Cascading spring lift */}
              <g
                className={`transition-transform duration-300 ease-out ${
                  isSubsActive
                    ? "-translate-y-1.5"
                    : "group-hover:-translate-y-1.5"
                }`}
              >
                <path
                  d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                  className="transition-colors duration-200"
                />
                {/* Micro activity dot inside top tier cap */}
                <circle
                  cx="12"
                  cy="4.5"
                  r="1.1"
                  fill="currentColor"
                  stroke="none"
                  className={`transition-opacity duration-300 ${
                    isSubsActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </g>

              {/* Middle Tier - Staggered secondary lift */}
              <path
                d="M5 11V9a2 2 0 012-2h10a2 2 0 012 2v2"
                className={`transition-transform duration-300 delay-75 ease-out ${
                  isSubsActive
                    ? "-translate-y-0.75"
                    : "group-hover:-translate-y-0.75"
                }`}
              />

              {/* Bottom Tier (Main Base Container) */}
              <path
                d="M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>
        <PrismText
          text="Subscriptions"
          className="text-[11px] tracking-tight mt-0.5"
          baseColor={isSubsActive ? "font-bold text-gray-950 dark:text-white" : "font-medium text-gray-500 dark:text-gray-400"}
        />
      </Link>

      {/* 5. YOU */}
      <Link
        to="/your_channel"
        onMouseEnter={handleProfileMouseEnter}
        onMouseLeave={handleProfileMouseLeave}
        className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-200 group ${
          isYouActive
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        aria-label="You"
      >
        {/* Material You Tonal Pill Container */}
        <div
          className={`w-[66px] h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isYouActive
              ? "bg-gray-200/90 dark:bg-gray-800/90"
              : "bg-transparent group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40"
          }`}
        >
          <ProfileAnimAvatar
            avatar={currentUser?.avatar}
            userInitial={userInitial}
            animIndex={activeAnimIndex}
            isActive={isYouActive}
            isHovered={isProfileHovered}
            size="w-7 h-7"
          />
        </div>
        <PrismText
          text="You"
          className="text-[11px] tracking-tight mt-0.5"
          baseColor={isYouActive ? "font-bold text-gray-950 dark:text-white" : "font-medium text-gray-500 dark:text-gray-400"}
        />
      </Link>
    </nav>
  );
}

export default MobileBottomNav;
