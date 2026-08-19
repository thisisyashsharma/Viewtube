import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import PageContainer from "./layout/PageContainer";
import { getCurrentUser, logout } from "../store/slice/authSlice";
import { LineDrawIcon, PrismText, ProfileAnimAvatar, ThemeToggleButton } from "./common";
import { getThumbnailUrl, formatDuration } from "../utils/thumbnail.utils";

function YourChannel() {
  const data = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [userdata, setUserData] = useState();
  const [scrollY, setScrollY] = useState(0);

  // File upload states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [subsCount, setSubsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentView = searchParams.get("view"); // 'personalization' | 'videos' | null
  const showMobileNavMenu = currentView === "personalization";
  const showUserVideos = currentView === "videos";

  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const tabs = [
    { label: "Home", path: "/your_channel" },
    { label: "Videos", path: "/your_channel/videos" },
    { label: "About", path: "/your_channel/about" },
  ];

  const activeTabIndex = location.pathname.endsWith("/about")
    ? 2
    : location.pathname.endsWith("/videos") || location.pathname.endsWith("/upload_video")
    ? 1
    : 0;

  useEffect(() => {
    const currentTab = tabRefs.current[activeTabIndex];
    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.clientWidth,
      });
    }
  }, [activeTabIndex, location.pathname]);

  const [recentHistory, setRecentHistory] = useState([]);
  const [recentUserVideos, setRecentUserVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);

  const openSettingsView = () => {
    setSearchParams({ view: "personalization" });
  };

  const closeSettingsView = () => {
    setSearchParams({});
  };

  const openUserVideosView = () => {
    setSearchParams({ view: "videos" });
  };

  const closeUserVideosView = () => {
    setSearchParams({});
  };

  const fetchUser = async () => {
    try {
      if (!data?._id) return;
      const response = await axios.get(
        `/api/v1/account/userData/${data._id}`
      );
      setUserData(response.data.data);
      const st = await axios.get(
        `/api/v1/account/subscribe/status/${data._id}`
      );
      setSubsCount(st.data.data.count || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Fetch media for mobile You page
    const fetchMedia = async () => {
      try {
        const histRes = await axios.get("/api/v1/account/history", { withCredentials: true });
        setRecentHistory(histRes.data?.data || []);
      } catch (err) {
        console.error("Error fetching history for You page:", err);
      }
      try {
        if (data?._id) {
          const vidRes = await axios.get(`/api/v1/videos/allUserVideo/${data._id}`);
          setRecentUserVideos(vidRes.data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching user videos for You page:", err);
      }
      try {
        let likeRes;
        try {
          likeRes = await axios.get("/api/v1/videos/likes", { withCredentials: true });
        } catch {
          likeRes = await axios.get("/api/v1/likes", { withCredentials: true });
        }
        const raw = likeRes.data?.data;
        const items = Array.isArray(raw) ? raw : raw?.likedVideos || raw?.videos || [];
        setLikedVideos(items.map((item) => (item?.video ? item.video : item)).filter(Boolean));
      } catch (err) {
        console.error("Error fetching likes for You page:", err);
      }
    };
    fetchMedia();
  }, [data?._id]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  const userInitial = (userdata?.name || data?.name || "Y")[0].toUpperCase();

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarPreview(reader.result);
          setAvatarFile(file);
        } else {
          setBannerPreview(reader.result);
          setBannerFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setBannerPreview(null);
    setBannerFile(null);
  };

  const handleSave = async () => {
    if (!avatarFile && !bannerFile) return;

    const formData = new FormData();
    if (avatarFile) formData.append("avatar", avatarFile);
    if (bannerFile) formData.append("coverImage", bannerFile);

    try {
      setIsUploading(true);
      const res = await axios.put(`/api/v1/account/update/${data._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh user data globally and locally
      if (res.data?.data) {
        dispatch(getCurrentUser());
      }
      await fetchUser();
      handleCancel(); // Reset edit state
    } catch (error) {
      console.error("Error updating channel images:", error);
      alert("Failed to update channel images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isEditing = avatarPreview || bannerPreview;

  // Render variables for visuals
  const displayBanner = bannerPreview || (userdata?.coverImage ? getThumbnailUrl(userdata.coverImage) : (data?.coverImage ? getThumbnailUrl(data.coverImage) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"));
  const displayAvatar = avatarPreview || (userdata?.avatar ? getThumbnailUrl(userdata.avatar) : (data?.avatar ? getThumbnailUrl(data.avatar) : null));

  return (
    <PageContainer>
      {/* Editing Actions Bar */}
      {isEditing && (
        <div className="fixed bottom-[84px] sm:bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md sm:w-auto bg-white/95 dark:bg-[#181818]/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-full px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between sm:justify-center gap-2.5 sm:gap-4 border border-gray-200/90 dark:border-white/10 animate-slideUp">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              Unsaved changes
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleCancel}
              disabled={isUploading}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isUploading}
              className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:translate-y-[0.5px] rounded-full transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        ref={avatarInputRef} 
        onChange={(e) => handleImageChange(e, 'avatar')} 
        className="hidden" 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={bannerInputRef} 
        onChange={(e) => handleImageChange(e, 'banner')} 
        className="hidden" 
      />

      {/* ── DESKTOP CHANNEL VIEW (Visible on sm and larger) ── */}
      <div className="hidden sm:block">
        {/* Channel Header Banner */}
        <div className="relative w-full h-32 sm:h-48 md:h-64 rounded-2xl overflow-hidden bg-gray-900 dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm group/banner">
          {/* Parallax Banner Image */}
          <div 
            className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center transition-transform duration-75 ease-out"
            style={{ 
              backgroundImage: `url('${displayBanner}')`,
              transform: `translateY(${scrollY * 0.4}px)`
            }}
          />
          {/* Banner Edit Overlay */}
          <div 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center z-10"
          >
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold flex items-center space-x-2 border border-white/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Change Banner</span>
            </div>
          </div>
        </div>

        {/* Profile Info Section (Overlaps Banner) */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 -mt-12 sm:-mt-16 mb-8 z-20">
          {userdata ? (
            <>
              {/* Avatar Container with Hover */}
              <div 
                className="relative group/avatar cursor-pointer flex-shrink-0 drop-shadow-md"
                onClick={() => avatarInputRef.current?.click()}
              >
                {displayAvatar ? (
                  <img
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-[#0f0f0f] bg-white dark:bg-[#0f0f0f]"
                    src={displayAvatar}
                    alt={userdata.name || "Channel avatar"}
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-pink-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-[#0f0f0f] shadow-sm">
                    {userInitial}
                  </div>
                )}
                {/* Avatar Edit Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left sm:mt-16">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {userdata.name || "Channel Name"}
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                  Joined {formatDate(userdata.createdAt)} • {(subsCount ?? 0).toLocaleString()} subscribers
                </div>
                {userdata.about && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2 max-w-2xl">
                    {userdata.about}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Link
                    to="/customize_channel"
                    className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[40px] transition-colors shadow-2xs cursor-pointer"
                  >
                    Customize channel
                  </Link>
                  <ThemeToggleButton className="px-5 py-2.5 min-h-[40px]" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full animate-pulse border-4 border-white flex-shrink-0" />
              <div className="space-y-3 flex-1 min-w-0 sm:mt-16 w-full flex flex-col items-center sm:items-start">
                <div className="h-8 bg-gray-200 rounded w-48 sm:w-64 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 sm:w-40 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full max-w-md animate-pulse mt-3" />
              </div>
            </div>
          )}
        </div>

        {/* Profile Tabs Bar with Smooth Sliding Indicator */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none relative">
          <ul className="flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-400 min-w-max pb-1">
            {tabs.map((tab, idx) => {
              const isActive = activeTabIndex === idx;
              return (
                <li key={tab.label} ref={(el) => (tabRefs.current[idx] = el)}>
                  <Link
                    to={tab.path}
                    className={`inline-block py-2 px-1 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-gray-900 dark:text-gray-100 font-bold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Smooth Sliding Active Indicator Bar */}
          <div
            className="absolute bottom-0 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </div>

        {/* Desktop Tab Video Outlet */}
        <Outlet />
      </div>

      {/* ── RESPONSIVE MOBILE "YOU" VIEW (Exact YouTube Mobile App Design) ── */}
      <div className="block sm:hidden pb-12 pt-0.5">
        {/* VIEW 1: Settings & Navigation Inline Screen (Triggered by ⚙️ Icon) */}
        {showMobileNavMenu ? (
          <div className="space-y-4 pt-2">
            {/* Complete Navigation List in Exact Sequence */}
            <div className="rounded-2xl bg-gray-100/90 dark:bg-[#161616] border border-gray-200/80 dark:border-white/10 divide-y divide-gray-200/60 dark:divide-white/5 overflow-hidden shadow-xs">
              {/* 1. Account */}
              <Link
                to="/customize_channel"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Account</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 2. Video Studio */}
              <Link
                to="/videoStudio"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Video Studio</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 3. Dashboard */}
              <Link
                to="/dashboard"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Dashboard</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 4. Keyboard Shortcuts */}
              <Link
                to="/keyboardShortcut"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 5. Settings */}
              <Link
                to="/settings"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 6. Help */}
              <Link
                to="/help"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Help</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 7. Feedback */}
              <Link
                to="/feedback"
                className="flex items-center justify-between p-4 hover:bg-gray-200/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" className="w-5 h-5 flex-shrink-0" baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" activeColor="text-gray-950 dark:text-white" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Feedback</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>

              {/* 8. Sign out */}
              <button
                onClick={() => {
                  closeSettingsView();
                  dispatch(logout());
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <LineDrawIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" className="w-5 h-5 flex-shrink-0" baseColor="text-red-500 dark:text-red-400" activeColor="text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium">Sign out</span>
                </div>
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        ) : showUserVideos ? (
          /* VIEW 2: User's Uploaded Videos Only (Opened from "Your videos") */
          <div className="space-y-4 pt-1">
            {/* Top Back Bar */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/10 mb-2">
              <button
                onClick={closeUserVideosView}
                className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-lg font-semibold">Your Videos ({recentUserVideos.length})</span>
              </button>
              <Link
                to="/videoStudio"
                className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Studio
              </Link>
            </div>

            {/* User Uploads Feed */}
            {recentUserVideos.length > 0 ? (
              <div className="space-y-3.5 pt-1">
                {recentUserVideos.map((video) => (
                  <div key={video._id} className="flex space-x-3 group cursor-pointer">
                    <Link to={`/watch/${video._id}`} className="relative w-36 aspect-video rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-black/10 dark:border-white/10 shadow-xs block">
                      <img src={getThumbnailUrl(video.thumbnailUrl || video.thumbnail)} alt={video.title} className="w-full h-full object-cover" />
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/watch/${video._id}`}>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(video.views || 0).toLocaleString()} views • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "Recently uploaded"}
                        </p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-gray-100 dark:bg-[#161616] border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No videos uploaded yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Start sharing videos with your audience</p>
                <Link to="/videoStudio" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs transition-colors">
                  Upload video
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 3: Main "You" Hub View */
          <>
            {/* 1. Top Sub-Bar: Accounts Pill on Left, Bell + Search + Settings on Right */}
            <div className="flex items-center justify-between py-2 mb-2">
              {/* Accounts Dropdown Pill */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200/90 dark:bg-[#272727] text-gray-900 dark:text-white text-xs font-semibold border border-gray-300/80 dark:border-white/10 shadow-2xs hover:bg-gray-300 dark:hover:bg-[#333333] transition-colors"
              >
                <span>Accounts</span>
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Right Icons: Notification Bell, Search, Settings */}
              <div className="flex items-center space-x-3.5">
                {/* Bell Icon */}
                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1"
                  aria-label="Notifications"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Search Icon */}
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open_search_bar"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1"
                  aria-label="Search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Settings Gear Icon -> Opens Responsive Android Navigation View */}
                <button
                  type="button"
                  onClick={openSettingsView}
                  className="text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer p-1"
                  aria-label="Settings & Navigation"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 2. User Profile Info with Fixed Avatar Proportions */}
            <div className="flex items-center space-x-4 mb-4 mt-1">
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-16 h-16 min-w-16 max-w-16 min-h-16 max-h-16 rounded-full overflow-hidden shrink-0 cursor-pointer border-2 border-gray-300 dark:border-white/20 shadow-md bg-blue-600 flex items-center justify-center"
              >
                {displayAvatar ? (
                  <img
                    className="w-full h-full object-cover rounded-full"
                    src={displayAvatar}
                    alt={userdata?.name || "Avatar"}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userInitial}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight truncate">
                  {userdata?.name || data?.name || "Yash"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium">
                  {`@${(userdata?.username || data?.username || userdata?.name || data?.name || "CuriousYash").replace(/\s+/g, '')}`}
                </p>
              </div>
            </div>

            {/* 3. Action Pills: [View channel] & [Theme Toggle] */}
            <div className="flex items-center gap-2.5 mb-6">
              <Link
                to="/customize_channel"
                className="flex-1 inline-flex items-center justify-center py-2 px-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition-opacity hover:opacity-90 min-h-[38px] shadow-xs text-center"
              >
                View channel
              </Link>
              <ThemeToggleButton className="flex-1 min-h-[38px]" />
            </div>

            {/* 4. History Carousel Section with "History >" Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Link
                  to="/history"
                  className="flex items-center gap-1 text-lg font-bold text-gray-950 dark:text-white hover:text-blue-600 dark:hover:text-gray-300 transition-colors group cursor-pointer"
                >
                  <span>History</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Horizontal Scroll Reel with Pagination Capability */}
              <div className="flex gap-3.5 overflow-x-auto scrollbar-none pb-2 pt-0.5 scroll-smooth">
                {recentHistory.length > 0 ? (
                  recentHistory.map((video) => (
                    <div
                      key={video._id}
                      className="w-40 flex-shrink-0 flex flex-col group cursor-pointer"
                    >
                      <Link to={`/watch/${video._id}`} className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-800 border border-black/10 dark:border-white/10 shadow-xs block">
                        <img
                          src={getThumbnailUrl(video.thumbnailUrl || video.thumbnail)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {video.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs">
                            {formatDuration(video.duration)}
                          </span>
                        )}
                        {/* Red progress line */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-red-600" />
                      </Link>

                      <div className="flex items-start justify-between mt-2 gap-1">
                        <Link to={`/watch/${video._id}`} className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {video.owner?.name || video.owner?.username || "ViewTube"}
                          </p>
                        </Link>
                        <button className="text-gray-400 hover:text-black dark:hover:text-white p-0.5 mt-0.5 flex-shrink-0 cursor-pointer">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-4 px-4 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">No watch history yet</span>
                    <Link to="/home" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      Explore videos ➔
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Library Section */}
            <div className="space-y-4 mb-4">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Library</h3>

              {/* Filter Chips: [Recent ⌵] & [Playlists] */}
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-200/90 dark:bg-[#272727] text-gray-900 dark:text-white text-xs font-medium border border-gray-300/80 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-[#333333] transition-colors cursor-pointer">
                  <span>Recent</span>
                  <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Link
                  to="/playlist"
                  className="px-3.5 py-1.5 rounded-lg bg-gray-200/90 dark:bg-[#272727] text-gray-900 dark:text-white text-xs font-medium border border-gray-300/80 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-[#333333] transition-colors cursor-pointer"
                >
                  Playlists
                </Link>
              </div>

              {/* Library Stacked Items */}
              <div className="space-y-4 pt-1">
                {/* Item 1: Your videos -> Opens User's Uploaded Videos */}
                <div
                  onClick={openUserVideosView}
                  className="flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="relative w-28 h-16 rounded-xl bg-gray-200 dark:bg-[#222] border border-gray-300/80 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {recentUserVideos[0]?.thumbnailUrl || recentUserVideos[0]?.thumbnail ? (
                      <img
                        src={getThumbnailUrl(recentUserVideos[0].thumbnailUrl || recentUserVideos[0].thumbnail)}
                        alt="Your videos"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
                    )}
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white">
                        <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-gray-300 transition-colors">Your videos</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{recentUserVideos.length} videos</p>
                  </div>
                </div>

                {/* Item 2: Liked videos */}
                <Link
                  to="/like"
                  className="flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="relative w-28 h-16 rounded-xl bg-gray-200 dark:bg-[#222] border border-gray-300/80 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {likedVideos[0]?.thumbnailUrl || likedVideos[0]?.thumbnail ? (
                      <img
                        src={getThumbnailUrl(likedVideos[0].thumbnailUrl || likedVideos[0].thumbnail)}
                        alt="Liked videos"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-neutral-900" />
                    )}
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-black/70 backdrop-blur-xs border border-white/15 flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-gray-300 transition-colors">Liked videos</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Private</p>
                  </div>
                  <button className="text-gray-400 hover:text-black dark:hover:text-white p-1 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </Link>

                {/* Item 3: Watch later */}
                <Link
                  to="/playlist"
                  className="flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="relative w-28 h-16 rounded-xl bg-gray-200 dark:bg-[#222] border border-gray-300/80 dark:border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {recentHistory[1]?.thumbnailUrl || recentHistory[1]?.thumbnail ? (
                      <img
                        src={getThumbnailUrl(recentHistory[1].thumbnailUrl || recentHistory[1].thumbnail)}
                        alt="Watch later"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-neutral-900" />
                    )}
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-black/70 backdrop-blur-xs border border-white/15 flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-gray-300 transition-colors">Watch later</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Private • Playlist</p>
                  </div>
                  <button className="text-gray-400 hover:text-black dark:hover:text-white p-1 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default YourChannel;
