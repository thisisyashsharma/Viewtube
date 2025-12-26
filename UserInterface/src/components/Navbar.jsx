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

function Navbar({ openChange }) {
  const [userdata, setUserData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null); 
  const navigate = useNavigate();

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
          const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
          const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());

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
    // if (data._id) {
    const fetchUser = async () => {
      try {
        // setLoader(true);
        const response = await axios.get(
          `/api/v1/account/userData/${data._id}`
        );
        const userData = response.data.data;
        setUserData(userData);
        // setLoader(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
    // }
  }, [data]);

  return (
    <>
      <nav className="fixed z-30 w-full bg-white border-b-4 border-gray-100 ">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 ">
          <div className="flex items-center justify-between ">
            <div className="flex items-center justify-start ">
              <button
                onClick={toggleSidebar}
                className="fixed top-1 lg:top-2 left-3 z-40 flex items-center justify-center w-10 h-10 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200  hover:bg-gray-100 group"
              >

                <img
                  src="/src/assets/svg_icons/menu.svg"
                  alt="Icon"
                  className="fixed-size-icon w-6 h-6"
                />
              </button>

              <a
                className="flex items-center justify-center ml-14 md:mr-24 text-2xl font-bold text-gray-700"
                href="/"
              >
                <img src={logo} className="mr-2.5 h-6" alt="Project Logo" />
                <span>Video Management</span>
              </a>

              <form
                onSubmit={handleSearchSubmit}
                method="get"
                className="hidden lg:block relative"
                style={{ marginLeft: 200 }}
                ref={searchRef}
              >
                <label htmlFor="topbar-search" className="sr-only">
                  Search
                </label>
                <div className="relative m-1 lg:w-96 group">
                  <div className="absolute inset-y-0  flex items-center p-3 pointer-events-none
                  m-[4px]
                  rounded-l-[2rem]
               
                  ">
                    <svg
                       className="
                        w-7 h-8
                        text-gray-400
                        group-focus-within:text-blue-700
                        transition-colors
                      "
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    style={{ height: 34 }}
                    name="search"
                    id="topbar-search"
                    className="bg-gray-50 border-4 border-color-[#F2F2F2]  text-gray-500 focus:text-black font-medium  sm:text-lg rounded-[3rem]  focus:border-blue-500  w-full px-11 pl-[2.9rem] p-5 
                    
                    focus:outline-none 
                    "
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />

                  {/* Clear button when there's text */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setShowResults(false);
                      }}
                      className="absolute inset-y-0 right-1 w-11
                      pl-2
                      my-1
                      flex items-center 
                       rounded-r-[2rem]
                      "
                      >
                      <svg
                        className="w-6 h-6 text-gray-500 
                        hover:text-red-500 

                         "
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Loading indicator */}
                  {isSearching && (
                    <div className="absolute inset-y-0 right-10 flex items-center pr-3">
                      <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 p-2 w-96 bg-white 
                  rounded-[1.5rem]
                   shadow-2xl border-4 border-gray-200 z-50 max-h-96 overflow-y-auto
                  
                  ">
                     <div className="p-4 mb-3 bg-gray-100  border-gray-100
                     rounded-t-[0.8rem]
                     ">
                      <p className="text-md font-semibold text-gray-700">
                        Searched {searchResults.length}  Results 
                      </p>
                    </div> 
                    {/*
                    */}
                    <div className="divide-y-2 divide-gray-50">
                      {searchResults.map((video) => (
                        <div
                          key={video._id}
                          className="flex items-center p-3 hover:bg-gray-100 m-1 rounded-[0.8rem] cursor-pointer transition-colors"
                          onClick={() => handleResultClick(video._id)}
                        >
                          <div className="w-16 h-12 flex-shrink-0 rounded-[0.6rem] overflow-hidden bg-gray-100">
                            <img
                              src={getThumbnailUrl(video)}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "http://localhost:8000/placeholders/noThumbnail.png";
                              }}
                            />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {video.title}
                            </p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span>{video.owner?.name || "Unknown"}</span>
                              <span className="mx-1">•</span>
                              <span>{video.views || 0} views</span>
                              <span className="mx-1">•</span>
                              <span>{formatDuration(video?.duration || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100
                    hover:bg-gray-100 
                    rounded-b-[1rem]
                    "
                    >
                      <button
                        onClick={() => {
                          navigate(`/home?q=${encodeURIComponent(searchQuery)}`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 "
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  </div>
                )}

                {/* No results message */}
                {showResults && !isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 mt-1 w-96 bg-white rounded-[1rem] shadow-2xl border-4 border-gray-200 z-50 p-4">
                    <p className="text-sm text-gray-500 text-center">
                      No videos found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </form>

            </div>

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
                {dropdownVisible && (
                  <div
                    ref = {profileRef}
                    className="absolute right-0 z-50 mt-2 min-w-80  divide-y divide text-base list-none bg-white  rounded-[1.4rem] shadow-xl-gray-300 border-[0.4rem] border-gray-100 "
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
                          <span className="flex items-center ml-3">
                            Account
                          </span>
                        </Link>
                      </li>
                      <li
                        className="hover:bg-gray-100"
                      >
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

                      <li
                        className="hover:bg-gray-100"
                      >
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
                      <li
                        className="hover:bg-gray-100"
                      >
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
                      <li
                        className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/settings"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/settings.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Settings
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li
                        className="hover:bg-gray-100"
                      >
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
                          <span className="flex items-center ml-3">
                            Feedback
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li
                        className=" focus:bg-red-100 hover:text-red-500 "
                      >
                        <button
                          onClick={handleSignOut}
                          className="block flex items-center p-3 px-3 w-full hover:bg-gray-100 focus:scale-95"
                        >
                          <img
                            src="/src/assets/svg_icons/signout.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Sign out
                          </span>
                        </button>
                      </li>
                      <li
                        className="hover:bg-red-50 focus:bg-red-100 hover:text-red-500 "
                      >
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
                      <li
                        className="m-2"
                      >

                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
