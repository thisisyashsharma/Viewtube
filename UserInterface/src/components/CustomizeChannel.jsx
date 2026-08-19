import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PageContainer from "./layout/PageContainer";
import { getThumbnailUrl } from "../utils/thumbnail.utils";
import { updateUserData, getCurrentUser } from "../store/slice/authSlice";

function CustomizeChannel() {
  const data = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  // Banner / Cover Image states
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const bannerInputRef = useRef(null);

  // Accordion Expand/Collapse States
  const [expanded, setExpanded] = useState({
    name: false,
    email: false,
    about: false,
    password: false,
  });

  const toggleSection = (sec) => {
    setExpanded((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUserData = async () => {
    if (!data?._id) return;
    try {
      setLoader(true);
      const res = await axios.get(`/api/v1/account/userData/${data._id}`);
      const u = res?.data?.data || {};
      setName(u.name || "");
      setEmail(u.email || "");
      setAbout(u.about || "");
      if (u.avatar) {
        setAvatarUrl(u.avatar);
      }
      if (u.coverImage) {
        setCoverImageUrl(u.coverImage);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [data?._id]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const updateField = async (partialFormData, fieldName) => {
    try {
      setSavingField(fieldName);
      const fd = new FormData();
      Object.entries(partialFormData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      const res = await axios.put(`/api/v1/account/update/${data._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const updatedUser = res.data?.data;
      if (updatedUser) {
        if (updatedUser.avatar) {
          setAvatarUrl(updatedUser.avatar);
          setAvatarFile(null);
          setAvatarPreview(null);
        }
        if (updatedUser.coverImage) {
          setCoverImageUrl(updatedUser.coverImage);
          setBannerFile(null);
          setBannerPreview(null);
        }
        // Update Redux globally
        dispatch(updateUserData(updatedUser));
        dispatch(getCurrentUser());
      }

      showToast("Updated successfully ✔");
      if (fieldName && fieldName !== "avatar" && fieldName !== "coverImage") {
        setExpanded((prev) => ({ ...prev, [fieldName]: false }));
      }
    } catch (e) {
      console.error("Update failed", e);
      showToast(e?.response?.data?.message || "Update failed. Please try again.", "error");
    } finally {
      setSavingField(null);
    }
  };

  const saveName = () => updateField({ name }, "name");
  const saveEmail = () => updateField({ email }, "email");
  const saveAbout = () => updateField({ about }, "about");
  const savePassword = async () => {
    if (!password || password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    await updateField({ password }, "password");
    setPassword("");
  };
  const saveAvatar = async () => {
    if (!avatarFile) return;
    await updateField({ avatar: avatarFile }, "avatar");
  };
  const saveBanner = async () => {
    if (!bannerFile) return;
    await updateField({ coverImage: bannerFile }, "coverImage");
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const cancelBannerPreview = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const userInitial = (name || data?.username || "Y")[0].toUpperCase();
  const displayAvatar = avatarPreview || (avatarUrl ? getThumbnailUrl(avatarUrl) : (data?.avatar ? getThumbnailUrl(data.avatar) : null));
  const displayBanner = bannerPreview || (coverImageUrl ? getThumbnailUrl(coverImageUrl) : (data?.coverImage ? getThumbnailUrl(data.coverImage) : null));

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
            Channel Customization
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tap any card to edit channel branding, profile info, and credentials
          </p>
        </div>

        {/* ── 1. BRANDING STUDIO CARD (Live Channel Canvas - Idea 1) ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Banner Hero Area */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 overflow-hidden group">
            {displayBanner && (
              <img
                src={displayBanner}
                alt="Channel Banner"
                className="w-full h-full object-cover"
              />
            )}

            {/* Banner Action Pill */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {bannerFile ? (
                <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg animate-fadeIn">
                  <button
                    type="button"
                    onClick={cancelBannerPreview}
                    className="px-3 py-1 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveBanner}
                    disabled={savingField === "coverImage"}
                    className="px-3.5 py-1 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingField === "coverImage" ? "Saving..." : "Save Banner"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer shadow-md"
                  title="Change Channel Banner"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Edit Banner</span>
                </button>
              )}
            </div>

            {/* Hidden Banner File Input */}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerSelect}
              className="hidden"
            />
          </div>

          {/* Avatar & Live Action Canvas (Zero Wasted Space) */}
          <div className="px-4 pb-3.5 pt-0 relative flex flex-col items-center text-center">
            {/* Overlapping Avatar with Integrated Camera Badge */}
            <div className="relative -mt-10 sm:-mt-12 group shrink-0">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#141414] bg-blue-600 flex items-center justify-center cursor-pointer shadow-xl relative"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Channel Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">{userInitial}</span>
                )}

                {/* Scrim on Hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Floating Camera Edit Action Badge */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center border-2 border-white dark:border-[#141414] shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                title="Change Profile Photo"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Hidden Avatar File Input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            {/* Floating Avatar Save / Cancel Bar (When new photo selected) */}
            {avatarFile && (
              <div className="mt-2.5 flex items-center gap-1.5 bg-gray-100 dark:bg-[#222] p-1 rounded-full border border-gray-200 dark:border-white/10 shadow-sm animate-fadeIn">
                <button
                  type="button"
                  onClick={cancelAvatarPreview}
                  className="px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAvatar}
                  disabled={savingField === "avatar"}
                  className="px-3.5 py-1 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingField === "avatar" ? "Saving..." : "Save Photo"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. CHANNEL NAME CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header */}
          <button
            type="button"
            onClick={() => toggleSection("name")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.name}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Channel Name
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 truncate max-w-[130px]">
                {name || "Set Name"}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.name ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
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
              expanded.name ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Enter the display name for your channel:
                </p>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your channel name"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleSection("name")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={savingField === "name"}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingField === "name" ? "Saving..." : "Save Name"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. EMAIL ADDRESS CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header */}
          <button
            type="button"
            onClick={() => toggleSection("email")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.email}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Email Address
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 truncate max-w-[140px]">
                {email || "Set Email"}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.email ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
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
              expanded.email ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Update the primary email address for your channel account:
                </p>
                <input
                  type="email"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleSection("email")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEmail}
                    disabled={savingField === "email"}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingField === "email" ? "Saving..." : "Save Email"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. CHANNEL DESCRIPTION CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header */}
          <button
            type="button"
            onClick={() => toggleSection("about")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.about}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Description
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                {about ? `${about.length} chars` : "Empty"}
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.about ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
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
              expanded.about ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Tell viewers about your channel and content:
                </p>
                <textarea
                  rows={4}
                  maxLength={1000}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell viewers about your channel, topics, and upload schedules…"
                  autoFocus
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {about.length} / 1000 characters
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSection("about")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveAbout}
                      disabled={savingField === "about"}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingField === "about" ? "Saving..." : "Save Description"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. PASSWORD & SECURITY CARD ── */}
        <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200/80 dark:border-white/10 shadow-2xs overflow-hidden transition-all duration-200">
          {/* Card Header */}
          <button
            type="button"
            onClick={() => toggleSection("password")}
            className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer"
            aria-expanded={expanded.password}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-950 dark:text-white truncate">
                Update Password
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 font-mono">
                ••••••••
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 transition-transform duration-300 ease-out ${
                  expanded.password ? "rotate-90 text-gray-900 dark:text-white" : "rotate-0"
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
              expanded.password ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Enter your new password (minimum 6 characters):
                </p>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/10 text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPassword("");
                      toggleSection("password");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePassword}
                    disabled={savingField === "password"}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingField === "password" ? "Saving..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Done / Return Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/your_channel")}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white dark:text-black bg-gray-950 dark:bg-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

export default CustomizeChannel;
