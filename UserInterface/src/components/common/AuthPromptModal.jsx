import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AuthPromptModal({ isOpen, onClose, actionType = "action" }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow DOM to render before applying animation classes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setShouldRender(false), 400); // match longest duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  // Determine copy based on actionType
  let title = "Sign in required";
  let description = "You need to be signed in to perform this action.";

  if (actionType === "like") {
    title = "Like this video?";
    description = "Sign in to make your opinion count.";
  } else if (actionType === "subscribe") {
    title = "Want to subscribe to this channel?";
    description = "Sign in to subscribe to this channel.";
  } else if (actionType === "comment") {
    title = "Want to join the conversation?";
    description = "Sign in to add a comment.";
  } else if (actionType === "save") {
    title = "Want to save this video?";
    description = "Sign in to save videos to playlists.";
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal,60)] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Modal Card with "Parallax Rolling" transition */}
      <div 
        className={`relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animateIn ? "translate-y-0 scale-100 opacity-100 rotate-0" : "translate-y-16 scale-95 opacity-0 rotate-1"
        }`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Icon wrapper with staggered parallax entry */}
        <div 
          className={`w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-5 transition-all duration-500 delay-75 ease-out ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Text content staggered */}
        <h3 
          className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-all duration-500 delay-100 ease-out ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {title}
        </h3>
        
        <p 
          className={`text-sm text-gray-500 dark:text-gray-400 mb-8 transition-all duration-500 delay-150 ease-out ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {description}
        </p>

        {/* Action Buttons staggered */}
        <div 
          className={`flex flex-col w-full gap-3 transition-all duration-500 delay-200 ease-out ${
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Link 
            to="/login"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
          >
            Sign in
          </Link>
          <Link 
            to="/signup"
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
