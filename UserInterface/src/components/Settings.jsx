import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PageContainer from "./layout/PageContainer";
import { useTheme } from "../context/ThemeContext";
import { ProfileAnimAvatar } from "./common";
import { getThumbnailUrl } from "../utils/thumbnail.utils";
import { updateUserData, getCurrentUser } from "../store/slice/authSlice";

const ANIMATION_PRESETS = [
  { id: 0, name: "Conic Orbit", desc: "Smooth halo beam with beacon dot" },
  { id: 1, name: "Binary Pulsar", desc: "Dual rotating orbiting satellites" },
  { id: 2, name: "Glass Shimmer", desc: "Refractive optical lens sheen" },
  { id: 3, name: "Spotlight Arcs", desc: "Dual counter-spinning light beams" },
  { id: 4, name: "Creator Sparks", desc: "3 celestial rising micro-sparks" },
  { id: 5, name: "Diamond Pips", desc: "4 cardinal diamond tracker accents" },
  { id: 6, name: "Neon Pulse", desc: "Breathing ambient aura glow" },
  { id: 7, name: "Laser Scan", desc: "Biometric HUD beam line scan" },
  { id: 8, name: "Equalizer", desc: "Live studio audio wave visualizer" },
  { id: 9, name: "Gyro Ring", desc: "Precision dynamic compass ring" },
];

function Settings() {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const userdata = useSelector((state) => state.auth.user);

  const [toastMessage, setToastMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Accordion Expand/Collapse States for each card
  const [expanded, setExpanded] = useState({
    appearance: false,
    animation: false,
    handle: false,
    delete: false,
  });

  const toggleSection = (sec) => {
    setExpanded((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Animation Setting State ('random' | 'off' | '0'..'9')
  const [animMode, setAnimMode] = useState(() => {
    return localStorage.getItem("viewtube_profile_anim_mode") || "random";
  });
  const [hoveredPreviewIdx, setHoveredPreviewIdx] = useState(null);
  const [isPlaygroundActive, setIsPlaygroundActive] = useState(false);

  const handleAnimModeChange = (mode) => {
    setAnimMode(mode);
    localStorage.setItem("viewtube_profile_anim_mode", mode);
    window.dispatchEvent(new CustomEvent("viewtube_profile_anim_change", { detail: mode }));
    const label = mode === "off" ? "Disabled" : mode === "random" ? "Random Shuffle" : `Style ${Number(mode) + 1}`;
    showToast(`Profile animation: ${label}`);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast(`${newTheme === "dark" ? "Dark" : "Light"} theme activated`);
  };

  const handleDeleteChannel = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/v1/account/delete/${userdata._id}`);
      setShowDeleteModal(false);
      navigate("/signup");
    } catch (error) {
      console.error("Channel delete error:", error);
      showToast(error?.response?.data?.message || "Failed to delete channel", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- Username change + availability ----------
  const [username, setUsername] = useState(userdata?.username || "");
  const [checkState, setCheckState] = useState(null); // null | "checking" | true | false
  const [uMsg, setUMsg] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(userdata?.username || "");
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  useEffect(() => {
    if (userdata?.username) {
      setCurrentUsername(userdata.username);
      setUsername(userdata.username);
    }
  }, [userdata?.username]);

  const usernameOk = (u) => /^[a-z0-9_]{3,20}$/.test(String(u).toLowerCase());

  const checkAvailability = async (valueFromChange) => {
    setUMsg("");
    const u = (valueFromChange ?? username).trim().toLowerCase();

    if (!usernameOk(u)) {
      setCheckState(false);
      setUMsg("Use 3-20 chars: a-z, 0-9, _");
      return false;
    }
    try {
      setCheckState("checking");
      const res = await axios.get(
        `/api/v1/account/username/availability?username=${encodeURIComponent(u)}`,
        { withCredentials: true }
      );
      const available = !!res?.data?.data?.available;
      setCheckState(available ? true : false);
      setUMsg(available ? "Available ✔" : "Handle already taken");
      return available;
    } catch (e) {
      setCheckState(false);
      setUMsg("Could not check availability");
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
      await checkAvailability(value);
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
      setUMsg("Use 3-20 chars: a-z, 0-9, _");
      return;
    }
    try {
      setIsSavingUsername(true);
      const res = await axios.put(
        `/api/v1/account/username`,
        { username: u },
        { withCredentials: true }
      );
      setCurrentUsername(u);
      if (res.data?.data) {
        dispatch(updateUserData({ username: u }));
        dispatch(getCurrentUser());
      }
      showToast(`Handle updated to @${u}`);
      setCheckState(null);
      setUMsg("");
      setExpanded((prev) => ({ ...prev, handle: false }));
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update handle", "error");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const userInitial = ((userdata?.name || userdata?.username || "Y")[0] || "Y").toUpperCase();
  const avatarUrl = userdata?.avatar ? getThumbnailUrl(userdata.avatar) : null;

  const selectedAnimName =
    animMode === "off"
      ? "Disabled"
      : animMode === "random"
      ? "Random Shuffle"
      : ANIMATION_PRESETS[Number(animMode)]?.name || `Style ${Number(animMode) + 1}`;

  // ---------------- UI ----------------
  return loader ? (
    <PageContainer>
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    </PageContainer>
  ) : (
    <PageContainer>
      <div className="max-w-xl mx-auto space-y-3 sm:space-y-4 px-3 sm:px-0 pt-2 pb-36 sm:pb-20">
        {/* Floating Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl border backdrop-blur-md animate-fadeIn transition-all ${
              toastMessage.type === "error"
                ? "bg-red-500/90 text-white border-red-400/30"
                : "bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-950 border-gray-700/50 dark:border-white/20"
            }`}
          >
            {toastMessage.text}
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden sm:block pb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tap any setting to view and customize options
          </p>
        </div>

        {/* ── 1. APPEARANCE CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header (Always Visible Title Row) */}
          <button
            type="button"
            onClick={() => toggleSection("appearance")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.appearance}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Appearance
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                {theme === "dark" ? "Dark 🌙" : "Light ☀️"}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.appearance ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Smooth Grid Accordion Body */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              expanded.appearance ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Choose your preferred light or dark theme mode:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-semibold text-xs transition-colors cursor-pointer ${
                      theme === "light"
                        ? "bg-gray-950 text-white dark:bg-white dark:text-black border-transparent shadow-xs font-bold"
                        : "bg-gray-50 dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#252525]"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                      <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-semibold text-xs transition-colors cursor-pointer ${
                      theme === "dark"
                        ? "bg-blue-600 text-white border-transparent shadow-xs font-bold"
                        : "bg-gray-50 dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#252525]"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. PROFILE ANIMATION CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header (Always Visible Title Row) */}
          <button
            type="button"
            onClick={() => toggleSection("animation")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.animation}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Profile Animation
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 truncate max-w-[140px]">
                {selectedAnimName}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.animation ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Smooth Grid Accordion Body */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              expanded.animation ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-4">
                
                {/* 🎮 Interactive Live Playground Deck */}
                <div
                  onMouseEnter={() => setIsPlaygroundActive(true)}
                  onMouseLeave={() => setIsPlaygroundActive(false)}
                  onClick={() => setIsPlaygroundActive((prev) => !prev)}
                  className="mt-2 p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200/80 dark:border-white/10 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/15 shrink-0 shadow-xs">
                      {animMode === "off" ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center text-gray-400 text-xs font-bold">
                          {userInitial}
                        </div>
                      ) : animMode === "random" ? (
                        <ProfileAnimAvatar
                          avatar={userdata?.avatar}
                          userInitial={userInitial}
                          animIndex={1}
                          isActive={true}
                          forceAnimate={true}
                          size="w-8 h-8"
                        />
                      ) : (
                        <ProfileAnimAvatar
                          avatar={userdata?.avatar}
                          userInitial={userInitial}
                          animIndex={Number(animMode)}
                          isActive={true}
                          forceAnimate={true}
                          size="w-8 h-8"
                        />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-2">
                        <span>Live Preview: {selectedAnimName}</span>
                        {animMode !== "off" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Active on navigation bar & profile avatar
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-200/80 dark:bg-[#282828] text-gray-600 dark:text-gray-300 border border-gray-300/60 dark:border-white/10 shrink-0">
                    Live
                  </span>
                </div>

                {/* Quick Action Toggles */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAnimModeChange("off")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-semibold text-xs transition-colors cursor-pointer ${
                      animMode === "off"
                        ? "bg-gray-950 text-white dark:bg-white dark:text-black border-transparent shadow-xs font-bold"
                        : "bg-gray-50 dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#252525]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <span>Turn Off</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnimModeChange("random")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-semibold text-xs transition-colors cursor-pointer ${
                      animMode === "random"
                        ? "bg-blue-600 text-white border-transparent shadow-xs font-bold"
                        : "bg-gray-50 dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#252525]"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                    <span>Random Shuffle</span>
                  </button>
                </div>

                {/* 10 Style Preset Showcase Tiles (Text-free, Large Avatars, Butter-Focus) */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-2.5 uppercase tracking-wider">
                    Select Animation Style
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
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
                          className={`relative py-5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-gray-100 dark:bg-[#252525] border-2 border-gray-950 dark:border-white ring-2 ring-gray-950/10 dark:ring-white/20 shadow-md"
                              : "bg-gray-50 dark:bg-[#181818] border border-gray-200/80 dark:border-white/5 hover:border-gray-400/60 dark:hover:border-white/20 hover:bg-gray-100/60 dark:hover:bg-[#202020]"
                          }`}
                        >
                          {/* Large Interactive Animated Avatar (Always in Infinite Loop) */}
                          <div className="w-12 h-12 flex items-center justify-center">
                            <ProfileAnimAvatar
                              avatar={userdata?.avatar}
                              userInitial={userInitial}
                              animIndex={idx}
                              isActive={isSelected}
                              isHovered={hoveredPreviewIdx === idx}
                              forceAnimate={true}
                              size="w-10 h-10"
                            />
                          </div>

                          {/* Subtle Butter Focus Indicator Pill (Clean & Non-Tacky) */}
                          <div className="mt-2 flex items-center justify-center h-1.5">
                            <div
                              className={`rounded-full transition-all duration-300 ${
                                isSelected
                                  ? "w-4 h-1 bg-gray-950 dark:bg-white opacity-100"
                                  : "w-1 h-1 bg-transparent opacity-0"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. EDIT CHANNEL LINK CARD ── */}
        <Link
          to="/customize_channel"
          className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] shadow-2xs cursor-pointer block"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
              Edit Channel
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 dark:border-white/10 bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>

        {/* ── 4. CHANNEL HANDLE CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header (Always Visible Title Row) */}
          <button
            type="button"
            onClick={() => toggleSection("handle")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.handle}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <span className="font-bold text-base">@</span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Channel Handle
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 px-2.5 py-1 rounded-full">
                @{currentUsername}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.handle ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Smooth Grid Accordion Body */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              expanded.handle ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Enter your unique channel handle name:
                </p>
                <div className="flex items-center bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-1 text-sm">@</span>
                  <input
                    className="bg-transparent text-sm text-gray-950 dark:text-white w-full focus:outline-none placeholder:text-gray-400 font-medium"
                    value={username}
                    onChange={handleChange}
                    placeholder="new_handle"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-semibold">
                    {checkState === "checking" ? (
                      <span className="text-gray-400">Checking availability...</span>
                    ) : checkState === true ? (
                      <span className="text-emerald-600 dark:text-emerald-400">{uMsg || "Available ✔"}</span>
                    ) : (
                      <span className="text-red-500">{uMsg}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        toggleSection("handle");
                        setCheckState(null);
                        setUMsg("");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveUsername}
                      disabled={isSavingUsername || checkState !== true || !usernameOk(username)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingUsername ? "Saving..." : "Save Handle"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. DELETE CHANNEL CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-red-200/80 dark:border-red-950/50 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header (Always Visible Title Row) */}
          <button
            type="button"
            onClick={() => toggleSection("delete")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20 cursor-pointer"
            aria-expanded={expanded.delete}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-red-600 dark:text-red-400 truncate">
                Delete Channel
              </span>
            </div>

            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-red-400 transition-transform duration-300 ease-out ${
                expanded.delete ? "rotate-90 text-red-600" : "rotate-0"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          {/* Smooth Grid Accordion Body */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              expanded.delete ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-red-100 dark:border-red-950/40 space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 pt-1">
                  Permanently delete your channel, uploaded videos, comments, and subscriber counts. This cannot be recovered.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Delete Channel Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destructive Delete Channel Confirmation Dialog Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-[#181818] w-full max-w-md rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-white/10 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  Delete Channel Permanently?
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  This action will permanently remove your channel, subscribers, likes, and all uploaded videos. This cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChannel}
                  disabled={isDeleting}
                  className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Channel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default Settings;
