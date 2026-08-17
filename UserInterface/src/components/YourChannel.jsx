import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import PageContainer from "./layout/PageContainer";
import { getCurrentUser } from "../store/slice/authSlice";

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
      await axios.put(`/api/v1/account/update/${data._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh user data globally and locally
      await dispatch(getCurrentUser());
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
  const displayBanner = bannerPreview || userdata?.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
  const displayAvatar = avatarPreview || userdata?.avatar;

  return (
    <PageContainer>
      {/* Mobile Top App Bar for "You" page matching YouTube mobile */}
      <div className="sm:hidden flex items-center justify-between py-2 px-1 mb-4 border-b border-gray-100 dark:border-gray-800">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-300/80 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <span>Accounts</span>
          <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Link>

        <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
          <button className="p-1 hover:text-gray-900" title="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button onClick={() => navigate("/home")} className="p-1 hover:text-gray-900" title="Search">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link to="/settings" className="p-1 hover:text-gray-900" title="Settings">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Editing Actions Bar */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#0f0f0f] shadow-2xl rounded-full px-6 py-3 flex items-center space-x-4 border border-gray-200 dark:border-gray-800 animate-slideUp">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Unsaved changes</span>
          <button 
            onClick={handleCancel}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : "Save Changes"}
          </button>
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
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[40px] transition-colors shadow-2xs"
                >
                  Customize channel
                </Link>
                <button
                  onClick={() => alert("ViewTube Premium features coming soon!")}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white min-h-[40px] transition-colors shadow-2xs"
                >
                  Get Premium
                </button>
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
      <div className="mt-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none relative hidden sm:block">
        <ul className="flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-400 min-w-max pb-1">
          {tabs.map((tab, idx) => {
            const isActive = activeTabIndex === idx;
            return (
              <li key={tab.label} ref={(el) => (tabRefs.current[idx] = el)}>
                <Link
                  to={tab.path}
                  className={`inline-block py-2 px-1 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-gray-900 dark:text-gray-100 font-bold scale-105"
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



      {/* Tab Content */}
      <Outlet />
      
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </PageContainer>
  );
}

export default YourChannel;
