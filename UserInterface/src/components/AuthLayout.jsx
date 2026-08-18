import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

function AuthLayout({ children }) {
  const authStatus = useSelector((state) => state.auth.status);
  const location = useLocation();

  if (authStatus === false) {
    const path = location.pathname;
    const isSubscriptions = path.includes("subscriptions");
    const isChannel = path.includes("your_channel");
    const isLikes = path.includes("like");
    const isHistory = path.includes("history");
    const isPlaylist = path.includes("playlist");

    let title = "Sign in to ViewTube";
    let subtitle = "Sign in to access this page and manage your account";

    if (isSubscriptions) {
      title = "Don't miss new videos";
      subtitle = "Sign in to see updates from your favorite channels and creators.";
    } else if (isChannel) {
      title = "Enjoy your favorite videos";
      subtitle = "Sign in to access your channel, videos, playlists, and uploads.";
    } else if (isLikes) {
      title = "Keep track of what you love";
      subtitle = "Sign in to view your liked videos and watch them anytime.";
    } else if (isHistory) {
      title = "Keep track of what you watch";
      subtitle = "Watch history isn't viewable when signed out.";
    } else if (isPlaylist) {
      title = "Have fun with playlists";
      subtitle = "Sign in to create, organize, and view your saved playlists.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 shadow-sm border border-blue-100 dark:border-blue-800/30">
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
          {subtitle}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all duration-200"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-semibold transition-all duration-200"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return <>{authStatus === true ? children : null}</>;
}

export default AuthLayout;