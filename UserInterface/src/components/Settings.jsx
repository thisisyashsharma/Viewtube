import { Link, useNavigate } from "react-router-dom";
import img from "../assets/gde-najti-ssylku-na-svoj-kanal-youtube.jpg";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PageContainer from "./layout/PageContainer";
import { useTheme } from "../context/ThemeContext";
import { ProfileAnimAvatar } from "./common";

function Settings() {
  const { theme, setTheme } = useTheme();

  const [loader, setLoader] = useState(false);
  const userdata = useSelector((state) => state.auth.user);

  // Profile Animation Setting State ('random' | 'off' | '0'..'9')
  const [animMode, setAnimMode] = useState(() => {
    return localStorage.getItem("viewtube_profile_anim_mode") || "random";
  });
  const [isAnimCardOpen, setIsAnimCardOpen] = useState(false);
  const [hoveredPreviewIdx, setHoveredPreviewIdx] = useState(null);

  const handleAnimModeChange = (mode) => {
    setAnimMode(mode);
    localStorage.setItem("viewtube_profile_anim_mode", mode);
    window.dispatchEvent(new CustomEvent("viewtube_profile_anim_change", { detail: mode }));
  };

  const history = useNavigate();

  const handleDeleteClick = async () => {
    const value = confirm("Are you sure ?");

    if (value) {
      try {
        setLoader(true);
        const res = await axios.delete(
          `/api/v1/account/delete/${userdata._id}`
        );
        setLoader(false);
        alert("Your channel is deleted !");
        history("/signup");
      } catch (error) {
        console.log("Channel delete error :", error);
        alert(error);
      }
    }
  };

  // ---------- Username change + availability ----------
  const [username, setUsername] = useState(userdata?.username || "");
  const [checkState, setCheckState] = useState(null); // null | "checking" | true | false
  const [uMsg, setUMsg] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(
    userdata?.username || ""
  );

  const usernameOk = (u) => /^[a-z0-9_]{3,20}$/.test(String(u).toLowerCase());

  const checkAvailability = async (valueFromChange) => {
    setUMsg("");
    const u = (valueFromChange ?? username).trim().toLowerCase();

    if (!usernameOk(u)) {
      setCheckState(false);
      setUMsg("Use 3-20 chars a-z, 0-9, _");
      return false;
    }
    try {
      setCheckState("checking");
      const res = await axios.get(
        `/api/v1/account/username/availability?username=${encodeURIComponent(
          u
        )}`,
        { withCredentials: true }
      );
      const available = !!res?.data?.data?.available;
      setCheckState(available ? true : false);
      setUMsg(available ? "Available ✅" : "This handle isn't available");
      return available;
    } catch (e) {
      setCheckState(false);
      setUMsg("Could not check. Try again.");
      return false;
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setCheckState(null);
    setUMsg("");

    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(async () => {
      await checkAvailability(value); // use the latest typed value
    }, 500);

    setTypingTimeout(newTimeout);
  };

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  const saveUsername = async () => {
    setUMsg("");
    const u = username.trim().toLowerCase();
    if (!usernameOk(u)) {
      setUMsg("Use 3-20 chars a-z, 0-9, _");
      return;
    }
    try {
      setLoader(true);
      await axios.put(
        `/api/v1/account/username`,
        { username: u },
        { withCredentials: true }
      );
      setLoader(false);
      setUMsg("Username updated ✔");
      setCurrentUsername(u);
    } catch (e) {
      setLoader(false);
      setUMsg(e?.response?.data?.message || "Update failed");
    }
  };

  // ---------------- UI ----------------
  return loader ? (

    <PageContainer>
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    </PageContainer>
  ) : (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage account preferences and channel options</p>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Set up ViewTube your way</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize channel layout, branding, and handle</p>
            </div>
            <img src={img} className="h-16 w-24 object-cover rounded-xl flex-shrink-0" alt="Settings" />
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Appearance settings */}
            <div className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Appearance</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Choose your light or dark theme preference</div>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl self-start sm:self-auto border border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${theme === 'dark' ? 'bg-white text-gray-900 shadow-sm dark:bg-[#0f0f0f] dark:text-gray-100 dark:border dark:border-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Profile Animation Setting (Collapsible Responsive Card) */}
            <div className="py-3 sm:py-4">
              {/* Collapsible Header Button */}
              <button
                type="button"
                onClick={() => setIsAnimCardOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 text-left group p-1 -m-1 rounded-2xl transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/40 cursor-pointer"
                aria-expanded={isAnimCardOpen}
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>Profile Animation</span>
                    {/* Active State Pill */}
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60">
                      {animMode === 'off' ? 'Disabled' : animMode === 'random' ? 'Random' : `Style ${Number(animMode) + 1}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Customize interactive animation style for the mobile navigation profile icon
                  </div>
                </div>

                {/* Right Side: Mini Live Preview + Chevron Toggle */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* Current Active Preview Chip */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
                    {animMode === 'off' ? (
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    ) : animMode === 'random' ? (
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8" />
                        <line x1="4" y1="20" x2="21" y2="3" />
                        <polyline points="21 16 21 21 16 21" />
                        <line x1="15" y1="15" x2="21" y2="21" />
                        <line x1="4" y1="4" x2="9" y2="9" />
                      </svg>
                    ) : (
                      <ProfileAnimAvatar
                        avatar={userdata?.avatar}
                        userInitial={(userdata?.name || userdata?.username || "Y")[0].toUpperCase()}
                        animIndex={Number(animMode)}
                        isActive={true}
                        forceAnimate={true}
                        size="w-6 h-6"
                      />
                    )}
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-out ${
                      isAnimCardOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Opening & Closing Card Panel (Premium Spacious Grid) */}
              {isAnimCardOpen && (
                <div className="mt-3 p-4 sm:p-5 rounded-3xl bg-gray-50/90 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 space-y-4 animate-fade-in transition-all duration-300">
                  {/* Top Mode Options: Off & Random */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Off Button */}
                    <button
                      type="button"
                      onClick={() => handleAnimModeChange('off')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                        animMode === 'off'
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-transparent shadow-sm'
                          : 'bg-white dark:bg-[#0f0f0f] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      <span>Turn Off</span>
                    </button>

                    {/* Random Shuffle Button */}
                    <button
                      type="button"
                      onClick={() => handleAnimModeChange('random')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                        animMode === 'random'
                          ? 'bg-blue-600 text-white border-transparent shadow-sm ring-2 ring-blue-400/40'
                          : 'bg-white dark:bg-[#0f0f0f] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8" />
                        <line x1="4" y1="20" x2="21" y2="3" />
                        <polyline points="21 16 21 21 16 21" />
                        <line x1="15" y1="15" x2="21" y2="21" />
                        <line x1="4" y1="4" x2="9" y2="9" />
                      </svg>
                      <span>Random Shuffle</span>
                    </button>
                  </div>

                  {/* 10 Visual Option Cards (Spacious Premium Grid) */}
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wider">
                      Specific Styles (Tap to preview & select)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
                        const isSelected = animMode === String(idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAnimModeChange(String(idx))}
                            onMouseEnter={() => setHoveredPreviewIdx(idx)}
                            onMouseLeave={() => setHoveredPreviewIdx(null)}
                            title={`Style ${idx + 1}`}
                            className={`relative py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 group cursor-pointer ${
                              isSelected
                                ? 'bg-white dark:bg-[#1a1a1a] border-gray-950 dark:border-white shadow-md ring-2 ring-gray-950/20 dark:ring-white/30'
                                : 'bg-white dark:bg-[#0f0f0f] border-gray-200/90 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 shadow-2xs'
                            }`}
                          >
                            {/* Avatar Display Center Pedestal */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 transition-colors">
                              <ProfileAnimAvatar
                                avatar={userdata?.avatar}
                                userInitial={(userdata?.name || userdata?.username || "Y")[0].toUpperCase()}
                                animIndex={idx}
                                isActive={isSelected}
                                isHovered={hoveredPreviewIdx === idx}
                                forceAnimate={isSelected}
                                size="w-7 h-7"
                              />
                            </div>

                            {/* Style Indicator Text */}
                            <span className={`text-[11px] font-semibold transition-colors ${
                              isSelected
                                ? 'text-gray-950 dark:text-white font-bold'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                            }`}>
                              Style {idx + 1}
                            </span>

                            {/* Active Checkmark Badge */}
                            {isSelected && (
                              <span className="absolute top-2 right-2 w-4 h-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Edit channel */}
            <div className="py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit Channel</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Update name, avatar, and description</div>
              </div>
              <Link
                to="/customize_channel"
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                Edit
              </Link>
            </div>

            {/* Current username */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Current Handle</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your unique channel identifier</div>
              </div>
              <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full self-start sm:self-auto">
                @{currentUsername}
              </span>
            </div>

            {/* New username */}
            <div className="py-4 space-y-3">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Change Handle</div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 flex-1 focus-within:ring-2 focus-within:ring-blue-600">
                  <span className="text-blue-600 dark:text-blue-500 font-semibold mr-1">@</span>
                  <input
                    className="bg-transparent text-base text-gray-900 dark:text-gray-100 w-full focus:outline-none"
                    value={username}
                    onChange={handleChange}
                    placeholder="new_handle"
                  />
                </div>
                {checkState === true && usernameOk(username) && (
                  <button
                    type="button"
                    onClick={saveUsername}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                )}
              </div>
              {!!uMsg && (
                <div
                  className={`text-xs font-semibold ${
                    checkState === true
                      ? "text-green-600"
                      : checkState === "checking"
                      ? "text-gray-500"
                      : "text-red-600"
                  }`}
                >
                  {checkState === "checking" ? "Checking availability..." : uMsg}
                </div>
              )}
            </div>

            {/* Delete channel */}
            <div className="py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="text-sm font-semibold text-red-600 dark:text-red-500">Delete Channel</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your channel and all videos</div>
              </div>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}


export default Settings;
