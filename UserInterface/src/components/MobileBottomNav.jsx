import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { LineDrawIcon } from "./common";

function MobileBottomNav() {
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);

  const path = location.pathname;

  const isHomeActive = path === "/" || path === "/home";
  const isShortsActive = path === "/shorts";
  const isSubsActive = path === "/subscriptions";
  const isYouActive = path.startsWith("/your_channel");

  // Get user initial if avatar not loaded
  const userInitial = (currentUser?.name || currentUser?.username || "Y")[0].toUpperCase();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-t-[0.35rem] border-gray-200/80 dark:border-gray-800/80 h-14 px-2 flex items-center justify-between shadow-lg">
      {/* 1. HOME */}
      <Link
        to="/home"
        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 group ${
          isHomeActive ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <LineDrawIcon
          path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          className="w-5 h-5"
          baseColor={isHomeActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}
          activeColor="text-gray-900 dark:text-gray-100"
          strokeWidth={isHomeActive ? 2 : 1.8}
        />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
      </Link>

      {/* 2. SHORTS */}
      <Link
        to="/shorts"
        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 group ${
          isShortsActive ? "text-red-600 font-bold" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <LineDrawIcon
          path="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          className="w-5 h-5"
          baseColor={isShortsActive ? "text-red-600" : "text-gray-500 dark:text-gray-400"}
          activeColor="text-red-600"
          strokeWidth={1.8}
        />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Shorts</span>
      </Link>

      {/* 3. CENTER PLUS / ADD UPLOAD BUTTON (NO TEXT) WITH ROTATE ANIMATION */}
      <div className="flex items-center justify-center flex-1 h-full">
        <Link
          to="/your_channel/upload_video"
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 active:rotate-90 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300 shadow-2xs group"
          aria-label="Upload video"
        >
          <LineDrawIcon
            path="M12 4v16m8-8H4"
            className="w-5 h-5"
            baseColor="text-gray-700 dark:text-gray-300"
            activeColor="text-gray-900 dark:text-gray-100"
            strokeWidth={1.8}
          />
        </Link>
      </div>

      {/* 4. SUBSCRIPTIONS */}
      <Link
        to="/subscriptions"
        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 group ${
          isSubsActive ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        <LineDrawIcon
          path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          className="w-5 h-5"
          baseColor={isSubsActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}
          activeColor="text-gray-900 dark:text-gray-100"
          strokeWidth={1.8}
        />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Subscriptions</span>
      </Link>

      {/* 5. YOU */}
      <Link
        to="/your_channel"
        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 group ${
          isYouActive ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      >
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt="You"
            className={`w-5 h-5 rounded-full object-cover border transition-all duration-200 ${
              isYouActive ? "border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20" : "border-gray-300 dark:border-gray-700"
            }`}
          />
        ) : (
          <div
            className={`w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
              isYouActive ? "ring-2 ring-pink-400" : ""
            }`}
          >
            {userInitial}
          </div>
        )}
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">You</span>
      </Link>
    </nav>
  );
}

export default MobileBottomNav;
