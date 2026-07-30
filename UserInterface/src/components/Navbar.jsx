import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";
import ChannelFilter from "./ChannelFilter";
import logo from "../assets/svg_icons/project.svg";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { useSelector } from "react-redux";
import axios from "axios";

function Navbar({ isDrawerOpen, onToggleDrawer, openChange }) {
  const [userdata, setUserData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

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
        // Sort by relevance (you can implement more sophisticated ranking)
        const sortedVideos = videos.sort((a, b) => {
          // Simple relevance: exact match in title first
          const aTitleMatch = a.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const bTitleMatch = b.title
            .toLowerCase()
            .includes(query.toLowerCase());

          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;

          // Then by views
          return b.views - a.views;
        });

        setSearchResults(sortedVideos);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), // 300ms debounce delay
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
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 z-[var(--z-nav,30)] w-full h-14 bg-white border-b border-gray-200 px-3 flex items-center justify-between">
        {/* ── Always-Mounted Morphing Mobile Search Bar (sm:hidden) ── */}
        {/* This element is always in the DOM. Clicking the search icon adds
            the .expanded class which CSS transitions smoothly animate.       */}
        <div className={`mobile-search-bar sm:!hidden ${isMobileSearchOpen ? "expanded" : ""}`}>
          {/* Search icon trigger (visible when collapsed) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 150);
            }}
            className="mobile-search-trigger text-gray-600 rounded-full hover:bg-gray-100 active:scale-90 transition-transform"
            aria-label="Open search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Back arrow (slides in when expanded) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false);
              setShowResults(false);
            }}
            className="mobile-search-back flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200/60 active:scale-90 transition-transform"
            aria-label="Close search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Input + clear + submit (fades in when expanded) */}
          <form onSubmit={handleSearchSubmit} className="mobile-search-input-wrap relative flex items-center" ref={searchRef}>
            <input
              ref={inputRef}
              type="text"
              className="w-full h-9 pl-2 pr-12 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="Search ViewTube..."
              value={searchQuery}
              onChange={handleSearchChange}
              tabIndex={isMobileSearchOpen ? 0 : -1}
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-10 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 rounded-full transition-all duration-200 active:scale-90"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Submit arrow */}
            <button
              type="submit"
              className="mobile-search-submit absolute right-1 bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Live suggestions dropdown */}
            {isMobileSearchOpen && showResults && (
              <div className="absolute left-0 right-0 top-12 z-50 bg-white border border-gray-200/80 rounded-2xl max-h-80 overflow-y-auto divide-y divide-gray-100">
                {isSearching ? (
                  <div className="p-4 text-center text-xs font-medium text-gray-500 flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => {
                        handleResultClick(video._id);
                        setIsMobileSearchOpen(false);
                      }}
                      className="p-2.5 flex items-center space-x-3 hover:bg-blue-50/60 active:bg-blue-100/80 cursor-pointer transition-colors group"
                    >
                      <img
                        src={getThumbnailUrl(video)}
                        alt={video.title}
                        className="w-12 h-8 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {video?.owner?.name || "Channel"}
                        </p>
                      </div>
                      <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-medium text-gray-500">
                    No video suggestions found
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {isMobileSearchOpen ? null : (


          <>
            {/* Left section: Drawer toggle & logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleSidebar}
                className="flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                <img
                  src="/src/assets/svg_icons/menu.svg"
                  alt="Menu"
                  className="w-6 h-6"
                />
              </button>

              <Link to="/home" className="flex items-center text-lg sm:text-xl font-bold text-gray-800">
                <img src={logo} className="mr-2 h-6 w-auto" alt="Project Logo" />
                <span className="hidden sm:inline truncate max-w-[160px] md:max-w-none">ViewTube</span>
              </Link>
            </div>

            {/* Center section: Highly Interactive & Aesthetic Search input bar */}
            <div
              className={`hidden sm:flex flex-1 mx-4 relative transition-all duration-300 ease-out ${
                isFocused ? "max-w-2xl" : "max-w-lg"
              }`}
              ref={searchRef}
            >
              <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center group">
                <input
                  ref={inputRef}
                  type="text"
                  name="search"
                  id="topbar-search"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full h-12 pl-12 pr-24 bg-gray-100/90 hover:bg-gray-100 border-[4px] border-gray-200/80 hover:border-gray-400/90 rounded-full text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-200 focus:border-[1px] focus:ring-4 focus:ring-blue-600/50 shadow-sm focus:shadow-lg transition-all duration-300"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
                
                {/* Interactive Left Search Icon */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-600 group-focus-within:text-blue-600 group-focus-within:scale-110 transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Right Action Elements inside the Input Bar */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setShowResults(false);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 hover:rotate-90 hover:scale-110 rounded-full transition-all active:scale-95"
                      title="Clear search"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {!isFocused && !searchQuery && (
                    <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-200/70 border border-gray-300/60 rounded-md shadow-2xs pointer-events-none transition-opacity">
                      <span>Ctrl</span>
                      <span>K</span>
                    </kbd>
                  )}

                  <button
                    type="submit"
                    className={`w-12 h-9 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center shadow-xs transition-all duration-200 flex-shrink-0 ${
                      isFocused || searchQuery ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                    }`}
                    title="Search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                </div>
              </form>



              {/* Desktop Floating Search Results Suggestions Dropdown */}
              {showResults && (
                <div className="absolute left-0 right-0 top-12 z-50 bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-glass max-h-96 overflow-y-auto divide-y divide-gray-100 transition-all duration-200 animate-fadeIn">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs font-medium text-gray-500 flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Searching suggestions...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((video) => (
                      <div
                        key={video._id}
                        onClick={() => handleResultClick(video._id)}
                        className="p-2.5 flex items-center space-x-3 hover:bg-blue-50/60 cursor-pointer transition-colors group"
                      >
                        <img
                          src={getThumbnailUrl(video)}
                          alt={video.title}
                          className="w-14 h-9 object-cover rounded-lg flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {video?.owner?.name || "Channel"} • {video.views || 0} views • {formatDuration(video?.duration ?? 0)}
                          </p>
                        </div>
                        <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                          <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs font-medium text-gray-500">
                      No video suggestions found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>



            {/* Right section: User profile */}
            <div className="flex items-center space-x-2">


            {/* Profile dropdown */}
            {authStatus && (
              <div className="relative ml-auto lg:ml-4">
                <button
                  type="button"
                  className="flex text-sm  rounded-full border-4 border-gray-50  focus:border-gray-200  focus:scale-[0.8] transition-all duration-300 "
                  id="user-menu-button-2"
                  aria-expanded={dropdownVisible}
                  onClick={toggleDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  {userdata ? (
                    <>
                      <img
                        className="w-8 h-8 rounded-full"
                        src={userdata.avatar}
                        alt="User"
                      />
                    </>
                  ) : (
                    <li class="flex items-center">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          class="w-6 h-6 me-2 text-gray-200 animate-spin fill-black"
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
                        <span class="sr-only">Loading...</span>
                      </div>
                      {/* Preparing your profile */}
                    </li>
                  )}
                </button>

                <div
                  ref={profileRef}
                  className={`absolute right-0 z-50 mt-2 min-w-80 divide-y text-base list-none bg-white/80 backdrop-blur-xl rounded-[1.4rem] shadow-glass border-[0.4rem] border-white/30 transform transition-all duration-200 ease-out origin-top-right ${
                    dropdownVisible
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-[0.9] translate-y-0 pointer-events-none"
                  }`}
                  id="dropdown-2"
                >
                  {userdata ? (
                    <>
                      <div className="p-5 flex  rounded-[1.6rem]">
                        <img
                          className="w-14 h-14 rounded-full"
                          src={userdata.avatar}
                          alt="User"
                        />
                        <div className="flex-1 px-3 mt-1 relative w-full max-w-auto overflow-hidden">
                          <p className="text-sm text-gray-900 mb-2">
                            {userdata.name}
                          </p>
                          <div className="border-2 m-1 mt-2 border-gray-100 "></div>
                          <p className="fixed-size text-sm font-nromal text-gray-900 truncate">
                            {" "}
                            {userdata.email}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>Loading user data...</div>
                  )}
                  <ul className="border-4 border-gray-100"></ul>
                  <ul className="flex-1 align-items py-1 text-sm font-medium text-gray-700">
                    <li>
                      <Link
                        to={"/customize_channel"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 "
                      >
                        <img
                          src="/src/assets/svg_icons/customize_account.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">Account</span>
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to={"/videoStudio"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                      >
                        <img
                          src="/src/assets/svg_icons/videostudio.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">
                          Video Studio
                        </span>
                      </Link>
                    </li>

                    <li className="hover:bg-gray-100">
                      <Link
                        to={"/dashboard"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                      >
                        <img
                          src="/src/assets/svg_icons/dashboard.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">
                          Dashboard
                        </span>
                      </Link>
                    </li>

                    <li className="my-1 border-2 border-gray-100"></li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to={"/keyboardShortcut"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                      >
                        <img
                          src="/src/assets/svg_icons/keyboard.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">
                          Keyboard Shortcuts
                        </span>
                      </Link>
                    </li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to={"/settings"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                      >
                        <img
                          src="/src/assets/svg_icons/settings.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">Settings</span>
                      </Link>
                    </li>
                    <li className="my-1 border-2 border-gray-100"></li>
                    <li className="hover:bg-gray-100">
                      <Link
                        to={"/help"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                      >
                        <img
                          src="/src/assets/svg_icons/help.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">Help</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/feedback"}
                        className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95 "
                      >
                        <img
                          src="/src/assets/svg_icons/feedback.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">Feedback</span>
                      </Link>
                    </li>
                    <li className="my-1 border-2 border-gray-100"></li>
                    <li className=" focus:bg-red-100 hover:text-red-500 ">
                      <button
                        onClick={handleSignOut}
                        className="block flex items-center p-3 px-3 w-full hover:bg-gray-100 focus:scale-95"
                      >
                        <img
                          src="/src/assets/svg_icons/signout.svg"
                          alt="Icon"
                          className="fixed-size-icon w-5 h-5"
                        />
                        <span className="flex items-center ml-3">Sign out</span>
                      </button>
                    </li>
                    <li className="hover:bg-red-50 focus:bg-red-100 hover:text-red-500 ">
                      <button
                        onClick={toggleDropdown}
                        className="group block flex items-center p-3 px-3 rounded-b-md w-full hover:text-red-600 focus:scale-95 focus:bg-red-100 transition-all duration-100 "
                      >
                        <img
                          src="/src/assets/svg_icons/close.svg"
                          alt="Icon"
                          className="fixed-size-icon w-4 h-4"
                        />
                        <span className="flex items-center ml-4 group-focus:text-red-600 group-focus:bg-red-100 ">
                          Close
                        </span>
                      </button>
                    </li>
                    <li className="m-2"></li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      </nav>
    </>
  );
}

export default Navbar;
