import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";
import ChannelFilter from "./ChannelFilter";
const logo = "/svg_icons/project.svg";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { useSelector } from "react-redux";
import axios from "axios";
import UploadVideo from "./UploadVideo";
import { useTheme } from "../context/ThemeContext";
import { LineDrawIcon, PrismText, ProfileAnimAvatar } from "./common";

function Navbar({ isDrawerOpen, onToggleDrawer, openChange }) {
  const { theme, toggleTheme } = useTheme();
  const [userdata, setUserData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Primary top-level bottom nav tabs (where standard hamburger menu is shown)
  const PRIMARY_BOTTOM_NAV_TABS = ["/", "/home", "/subscriptions", "/your_channel"];
  const isSubPage = !PRIMARY_BOTTOM_NAV_TABS.includes(location.pathname);

  // Profile Animation Setting State ('random' | 'off' | '0'..'9')
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

  const handleToggleSidebar = () => {
    if (onToggleDrawer) {
      onToggleDrawer();
    } else if (openChange) {
      openChange();
    }
  };


  useEffect(() => {
    const handleClickOutsideProfile = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutsideProfile);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideProfile);
    };
  }, [dropdownVisible]);

  // Debounce function for search
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      setShowResults(true);
      performSearch(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Perform actual search with debouncing
  const performSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 1) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get("/api/v1/videos/search", {
          params: { query: query.trim(), limit: 10 },
          withCredentials: true,
        });

        const videos = response.data.data?.videos || [];
        // Sort by relevance: exact match in title first
        const sortedVideos = videos.sort((a, b) => {
          const aTitleMatch = a.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const bTitleMatch = b.title
            .toLowerCase()
            .includes(query.toLowerCase());

          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          return b.views - a.views;
        });

        setSearchResults(sortedVideos);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  // Handle click on search result
  const handleResultClick = (videoId) => {
    navigate(`/watch/${videoId}`);
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dispatch = useDispatch();
  const toggleSidebar = () => {
    console.log("Sidebar toggle triggered");
    openChange();
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSignOut = () => {
    dispatch(logout());
    console.log("Sign out clicked");
  };

  const authStatus = useSelector((state) => state.auth.status);
  const data = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (data?._id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `/api/v1/account/userData/${data._id}`
          );
          const userData = response.data.data;
          setUserData(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUser();
    }
  }, [data]);

  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setShowResults(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);




  return (
    <>
      <nav className="fixed top-0 left-0 z-[var(--z-nav,30)] w-full h-16 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b-[0.35rem] border-gray-200/80 dark:border-gray-800/80 px-3 flex items-center justify-between transition-colors duration-200">
        
        {/* Left section: Back Button / Drawer Toggle & logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
          {isDrawerOpen ? (
            <button
              onClick={handleToggleSidebar}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#0f0f0f] rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
              aria-label="Close navigation menu"
              title="Close menu"
            >
              <LineDrawIcon
                path="M6 18L18 6M6 6l12 12"
                className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300"
                baseColor="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                activeColor="text-gray-900 dark:text-gray-100"
                strokeWidth={2.2}
              />
            </button>
          ) : isSubPage ? (
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/home");
                }
              }}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#0f0f0f] rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
              aria-label="Go back"
              title="Back"
            >
              <LineDrawIcon
                path="M15 19l-7-7 7-7"
                className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300"
                baseColor="text-gray-700 dark:text-gray-300 group-hover:text-gray-950 dark:group-hover:text-white"
                activeColor="text-gray-900 dark:text-gray-100"
                strokeWidth={2.4}
              />
            </button>
          ) : (
            <button
              onClick={handleToggleSidebar}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#0f0f0f] rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
              aria-label="Open navigation menu"
              title="Open menu"
            >
              <LineDrawIcon
                path="M4 6h16M4 12h16M4 18h16"
                className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300"
                baseColor="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                activeColor="text-gray-900 dark:text-gray-100"
                strokeWidth={2}
              />
            </button>
          )}

          <Link 
            to="/home" 
            className={`items-center text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 group ${
              isSearchOpen ? "hidden md:flex" : "flex"
            }`}
          >
            <img src={logo} className="mr-2 h-6 w-auto" alt="Project Logo" />
            <PrismText text="ViewTube" className="hidden sm:inline truncate max-w-[160px] md:max-w-none" />
          </Link>
        </div>

        {/* ── Unified Morphing Search Bar (Mobile & Desktop) ── */}
        <div 
          ref={searchRef}
          className={`relative ${
            isSearchOpen 
              ? "flex-1 mx-1 sm:mx-4 max-w-full sm:max-w-2xl h-10 sm:h-11" 
              : authStatus
                ? "mx-auto w-9 h-9 sm:w-10 sm:h-10 aspect-square flex-shrink-0"
                : "ml-auto mx-1 sm:mx-2 w-9 h-9 sm:w-10 sm:h-10 aspect-square flex-shrink-0"
          } flex justify-center items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
        >
          <div 
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden group ${
              isSearchOpen 
                ? "w-full h-10 sm:h-11 bg-white dark:bg-[#0c0c0c] backdrop-blur-xl border border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 focus-within:border-gray-900 dark:focus-within:border-white/40 focus-within:ring-2 focus-within:ring-gray-900/10 dark:focus-within:ring-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_25px_rgba(0,0,0,0.5)]" 
                : "w-9 h-9 sm:w-10 sm:h-10 aspect-square p-[1px] bg-gray-200/90 dark:bg-white/10 cursor-pointer flex-shrink-0 shadow-2xs"
            }`}
          >
            {/* Border Light Beam (Neutral Pure Light Beam on Search Icon) */}
            {!isSearchOpen && (
              <>
                <div 
                  className="absolute -inset-[200%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-beam"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(75, 85, 99, 0.75) 320deg, transparent 360deg)'
                  }}
                />
                <div 
                  className="absolute -inset-[200%] pointer-events-none opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 animate-border-beam hidden dark:block"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(255, 255, 255, 0.95) 325deg, transparent 360deg)'
                  }}
                />
              </>
            )}

            {/* Search Icon Trigger (Visible when closed) */}
            <button 
              type="button"
              onClick={() => {
                if (!isSearchOpen) {
                  setIsSearchOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }
              }}
              className={`flex items-center justify-center w-full h-full rounded-full bg-white dark:bg-[#0f0f0f] text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white transition-colors z-10 [perspective:600px] cursor-pointer ${
                isSearchOpen ? "pointer-events-none opacity-0 hidden" : "opacity-100"
              }`}
              aria-label="Search"
              title="Search"
            >
              <div className="w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center group-hover:animate-lens-flip transition-transform">
                <LineDrawIcon
                  path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  className="w-full h-full"
                  baseColor="text-gray-600 dark:text-gray-300"
                  activeColor="text-gray-950 dark:text-white"
                  strokeWidth={2.4}
                />
              </div>
            </button>

            {/* Search Loading Light Beam Indicator */}
            {isSearching && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-full pointer-events-none z-20">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-900 dark:via-white to-transparent animate-search-beam" />
              </div>
            )}

            {/* Input Form (Slides in from right) */}
            <form 
              onSubmit={handleSearchSubmit} 
              className={`absolute inset-0 flex items-center w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSearchOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"
              }`}
            >
              {/* Back Button (Closes search) */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowResults(false);
                }}
                className="flex items-center justify-center w-9 sm:w-12 h-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0 group cursor-pointer"
              >
                <LineDrawIcon
                  path="M15 19l-7-7 7-7"
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  baseColor="text-gray-400 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  activeColor="text-gray-950 dark:text-white"
                  strokeWidth={2.4}
                />
              </button>

              {/* Input with live high-contrast titanium text shimmer */}
              <div className="relative flex-1 h-full flex items-center min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  className={`w-full h-full bg-transparent text-sm sm:text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none min-w-0 px-1 ${
                    searchQuery 
                      ? "bg-clip-text text-transparent bg-[linear-gradient(110deg,#0f172a_35%,#475569_50%,#0f172a_65%)] dark:bg-[linear-gradient(110deg,#f1f5f9_35%,#ffffff_50%,#cbd5e1_65%)] animate-text-shimmer caret-gray-900 dark:caret-white" 
                      : "text-gray-900 dark:text-white caret-gray-900 dark:caret-white"
                  }`}
                  placeholder="Search ViewTube..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  tabIndex={isSearchOpen ? 0 : -1}
                  autoComplete="off"
                />
                {/* ⌘K / Ctrl+K Hint */}
                <div className={`absolute right-2 pointer-events-none transition-all duration-300 ease-out ${
                  searchQuery || !isSearchOpen ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'
                }`}>
                  <span className="hidden sm:flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/15 shadow-2xs">
                    ⌘K
                  </span>
                </div>
              </div>

              {/* Clear Button with Click Rotate-90 Micro-Interaction */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setIsClearing(true);
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                    setTimeout(() => {
                      setIsClearing(false);
                      inputRef.current?.focus();
                    }, 200);
                  }}
                  className={`flex items-center justify-center w-8 h-8 mr-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 flex-shrink-0 group cursor-pointer ${
                    isClearing ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
                  }`}
                  title="Clear search"
                >
                  <LineDrawIcon
                    path="M6 18L18 6M6 6l12 12"
                    className="w-4 h-4"
                    baseColor="text-gray-400 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    activeColor="text-gray-950 dark:text-white"
                    strokeWidth={2.5}
                  />
                </button>
              )}

              {/* High-Contrast Titanium Submit Search Button */}
              <button
                type="submit"
                className={`relative flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 mr-1 sm:mr-1.5 rounded-full transition-all duration-300 flex-shrink-0 overflow-hidden ${
                  searchQuery
                    ? "bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-md shadow-gray-900/20 dark:shadow-white/10 cursor-pointer"
                    : "text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent"
                }`}
                title="Search"
              >
                {/* Lens Icon */}
                <svg 
                  className={`absolute w-4 h-4 transition-all duration-300 ease-in-out ${searchQuery ? 'opacity-0 -rotate-90 pointer-events-none' : 'opacity-100 rotate-0'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.2} 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Right Arrow (Enter) Icon */}
                <svg 
                  className={`absolute w-4 h-4 transition-all duration-300 ease-in-out ${searchQuery ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90 pointer-events-none'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.4} 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          {/* Floating Search Results Suggestions Dropdown (Monochrome Titanium Card) */}
          {showResults && isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 w-full z-50 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/15 rounded-2xl shadow-2xl max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-white/10 transition-all duration-200 animate-fadeIn">
              {isSearching ? (
                <div className="flex flex-col bg-transparent">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-2.5 flex items-center space-x-3">
                      <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg flex-shrink-0 animate-shimmer bg-gray-200 dark:bg-white/10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-shimmer"></div>
                        <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-1/2 animate-shimmer"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((video, index) => (
                  <div
                    key={video._id}
                    onClick={() => {
                      handleResultClick(video._id);
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 flex items-center space-x-3 bg-transparent hover:bg-gray-100/80 dark:hover:bg-white/5 cursor-pointer transition-colors group animate-slide-fade-up"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative w-14 h-9 sm:w-16 sm:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10">
                      <img
                        src={getThumbnailUrl(video)}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-gray-950 dark:group-hover:text-white transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {video?.owner?.name || "Channel"} • {video.views || 0} views • {formatDuration(video?.duration ?? 0)}
                      </p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-transparent">
                  No video suggestions found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>



            {/* Right section: User profile & Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`${isSearchOpen ? "hidden md:flex" : "hidden sm:flex"} items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors focus:outline-none group`}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {/* Base Subtle Sun Stroke */}
                    <svg className="w-5 h-5 absolute inset-0 text-gray-700 dark:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {/* Active Reforming Sun with Continuous Line-Draw on Hover */}
                    <svg className="w-5 h-5 absolute inset-0 text-amber-500 dark:text-amber-300 group-hover:animate-sun-spin transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path pathLength="100" className="group-hover:animate-svg-draw transition-all" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {/* Base Subtle Moon Stroke */}
                    <svg className="w-5 h-5 absolute inset-0 text-gray-300 dark:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    {/* Active Reforming Moon with Continuous Line-Draw on Hover */}
                    <svg className="w-5 h-5 absolute inset-0 text-gray-800 dark:text-gray-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path pathLength="100" className="group-hover:animate-svg-draw transition-all" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Desktop Upload Video Button */}
              {authStatus && (
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className={`relative ${isSearchOpen ? "hidden md:inline-flex" : "hidden sm:inline-flex"} items-center justify-center p-[1px] rounded-full bg-gray-200/80 dark:bg-gray-700 text-sm transition-colors duration-300 group overflow-hidden`}
                  title="Upload video"
                >
                  {/* Border Light Sweep (Neutral Pure Light Beam) */}
                  <div 
                    className="absolute -inset-[200%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-beam"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(75, 85, 99, 0.75) 320deg, transparent 360deg)'
                    }}
                  />
                  <div 
                    className="absolute -inset-[200%] pointer-events-none opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 animate-border-beam hidden dark:block"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(255, 255, 255, 0.95) 325deg, transparent 360deg)'
                    }}
                  />

                  {/* Inner Pill Body */}
                  <div className="relative flex items-center justify-center px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 w-full h-full transition-colors duration-300">
                    <div className="relative flex items-center justify-center">
                      {/* Base Layer */}
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {/* Morphing Icon Container */}
                        <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          {/* Initial "+" Icon */}
                          <svg 
                            className="w-5 h-5 absolute inset-0 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 group-hover:rotate-45" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                          </svg>
                          {/* Interactive Floating Upload Arrow Icon */}
                          <svg 
                            className="w-5 h-5 absolute inset-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-upload-arrow transition-all duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <PrismText text="Upload" className="font-semibold whitespace-nowrap" />
                      </div>

                      {/* Shine Overlay — full contrast shimmer bands */}
                      <div className="absolute inset-0 flex items-center space-x-2 text-gray-900 dark:text-white pointer-events-none opacity-0 group-hover:opacity-100 animate-mask-shimmer transition-opacity duration-300" aria-hidden="true">
                        {/* Shimmer Overlay Morphing Icon */}
                        <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          <svg 
                            className="w-5 h-5 absolute inset-0 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 group-hover:rotate-45" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                          </svg>
                          <svg 
                            className="w-5 h-5 absolute inset-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-upload-arrow transition-all duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <span className="font-semibold whitespace-nowrap">Upload</span>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Profile dropdown */}
              {authStatus && (
                <div className="relative ml-auto lg:ml-2 flex-shrink-0">
                  <button
                    type="button"
                    className="relative z-50 flex items-center justify-center p-0.5 text-sm rounded-full transition-all duration-300 group cursor-pointer focus:outline-none"
                    id="user-menu-button-2"
                    aria-expanded={dropdownVisible}
                    onClick={toggleDropdown}
                    onMouseEnter={handleProfileMouseEnter}
                    onMouseLeave={handleProfileMouseLeave}
                  >
                    <span className="sr-only">Open user menu</span>
                    {userdata ? (
                      <ProfileAnimAvatar
                        avatar={userdata.avatar}
                        userInitial={(userdata.name || userdata.username || "Y")[0].toUpperCase()}
                        animIndex={activeAnimIndex}
                        isActive={dropdownVisible}
                        isHovered={isProfileHovered}
                        size="w-8 h-8"
                      />
                    ) : (
                      <li className="flex items-center">
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-6 h-6 me-2 text-gray-200 animate-spin fill-black"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      </li>
                    )}
                  </button>

                  <div
                    ref={profileRef}
                    className={`absolute right-0 z-50 mt-2 min-w-80 divide-y text-base list-none bg-white dark:bg-[#0f0f0f] rounded-[1.4rem] border-[0.35rem] border-gray-200 dark:border-gray-800 transform transition-all duration-200 ease-out origin-top-right ${
                      dropdownVisible
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                    id="dropdown-2"
                  >
                  {userdata ? (
                    <>
                      <div className="p-5 flex rounded-t-[1.2rem] bg-white dark:bg-[#0f0f0f] items-center">
                        <div className="flex-shrink-0">
                          <ProfileAnimAvatar
                            avatar={userdata.avatar}
                            userInitial={(userdata.name || userdata.username || "Y")[0].toUpperCase()}
                            animIndex={activeAnimIndex}
                            isActive={true}
                            forceAnimate={true}
                            size="w-14 h-14"
                          />
                        </div>
                        <div className="flex-1 px-3 relative w-full max-w-auto overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {userdata.name}
                          </p>
                          <div className="border-b-2 mx-0 my-1 border-gray-100 dark:border-gray-800"></div>
                          <p className="fixed-size text-xs font-normal text-gray-600 dark:text-gray-400 truncate mt-1">
                            {userdata.email}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-5 text-gray-700 dark:text-gray-300">Loading user data...</div>
                  )}
                  <ul className="border-t-4 border-gray-100 dark:border-gray-800/50"></ul>

                  {/* Mobile Quick Actions: Theme Toggle & Upload */}
                  <div className="flex sm:hidden items-center justify-around px-4 py-2.5 border-b-2 border-gray-100 dark:border-gray-800/50">
                    {/* Quick Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors group"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-500 dark:text-amber-300 group-hover:animate-sun-spin transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path pathLength="100" className="group-hover:animate-svg-draw transition-all" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-800 dark:text-gray-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path pathLength="100" className="group-hover:animate-svg-draw transition-all" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                      )}
                      <PrismText text={theme === 'dark' ? 'Light' : 'Dark'} className="text-sm font-medium" />
                    </button>

                    {/* Quick Upload */}
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(true);
                        setDropdownVisible(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors group"
                      aria-label="Upload video"
                    >
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg className="w-5 h-5 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                        </svg>
                        <svg className="w-5 h-5 absolute inset-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-upload-arrow transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <PrismText text="Upload" className="text-sm font-medium" />
                    </button>
                  </div>

                  <ul className="flex-1 align-items py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <li>
                      <Link
                        to={"/customize_channel"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Account" className="ml-3" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/videoStudio"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Video Studio" className="ml-3" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/dashboard"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Dashboard" className="ml-3" />
                      </Link>
                    </li>

                    <li className="my-1 border-b-2 border-gray-100 dark:border-gray-800/50"></li>
                    <li>
                      <Link
                        to={"/keyboardShortcut"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Keyboard Shortcuts" className="ml-3" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/settings"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Settings" className="ml-3" />
                      </Link>
                    </li>
                    <li className="my-1 border-b-2 border-gray-100 dark:border-gray-800/50"></li>
                    <li>
                      <Link
                        to={"/help"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Help" className="ml-3" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/feedback"}
                        className="flex items-center p-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <PrismText text="Feedback" className="ml-3" />
                      </Link>
                    </li>
                    <li className="my-1 border-b-2 border-gray-100 dark:border-gray-800/50"></li>
                    <li className="focus:bg-red-100 dark:focus:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400">
                      <button
                        onClick={handleSignOut}
                        className="block flex items-center p-3 px-4 w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <LineDrawIcon
                          path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400"
                          activeColor="text-red-600 dark:text-red-400"
                        />
                        <PrismText text="Sign out" className="ml-3" />
                      </button>
                    </li>
                    <li className="hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-100 dark:focus:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400">
                      <button
                        onClick={toggleDropdown}
                        className="group block flex items-center p-3 px-4 rounded-b-md w-full transition-all duration-100"
                      >
                        <LineDrawIcon
                          path="M6 18L18 6M6 6l12 12"
                          className="w-4 h-4 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400"
                          activeColor="text-red-600 dark:text-red-400"
                          strokeWidth={2.5}
                        />
                        <PrismText text="Close" className="ml-4 group-focus:text-red-600 dark:group-focus:text-red-400" />
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* If not logged in: Desktop Sign in button */}
            {!authStatus && (
              <div className={`${isSearchOpen ? "hidden md:flex" : "hidden sm:flex"} items-center flex-shrink-0 ml-1.5`}>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Sign in</span>
                </Link>
              </div>
            )}
          </div>
      </nav>

      {/* Controlled Desktop/Global Upload Video Modal */}
      <UploadVideo
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
