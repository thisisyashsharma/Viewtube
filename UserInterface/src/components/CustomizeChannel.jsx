import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageContainer from "./layout/PageContainer";


function CustomizeChannel() {
  const data = useSelector((state) => state.auth.user);
  const history = useNavigate();

  const [loader, setLoader] = useState(false);
  const [file, setFile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");

  const [password, setPassword] = useState("");

  const [editState, setEditState] = useState({ name: false, email: false, about: false, password: false });

  const toggleEdit = (field) => setEditState(prev => ({ ...prev, [field]: !prev[field] }));

  useEffect(() => {
    if (!data?._id) return;
    (async () => {
      try {
        setLoader(true);
        const res = await axios.get(`/api/v1/account/userData/${data._id}`);
        const u = res?.data?.data || {};
        setName(u.name || "");
        setEmail(u.email || "");
        setAbout(u.about || "");
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        setLoader(false);
      }
    })();
  }, [data?._id]);

  const updateField = async (partialFormData) => {
    // Sends only the changed field(s)
    try {
      setLoader(true);
      const fd = new FormData();
      Object.entries(partialFormData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      await axios.put(`/api/v1/account/update/${data._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("Updated ✔");
    } catch (e) {
      console.error("Update failed", e);
      alert(e?.response?.data?.message || "Update failed");
    } finally {
      setLoader(false);
    }
  };

  const saveName = () => updateField({ name });
  const saveEmail = () => updateField({ email });
  const saveAbout = () => updateField({ about });
  const savePassword = async () => {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    await updateField({ password });
    setPassword("");
  };
  const saveAvatar = async () => {
    if (!file) {
      alert("Choose an image first.");
      return;
    }
    await updateField({ avatar: file });
    setFile(null);
  };

  const InlineEditField = ({ label, value, type = "text", field, onChange, onSave, placeholder }) => {
    const isEditing = editState[field];
    return (
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 group relative">
        <label className="sm:w-32 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</label>
        {isEditing || field === 'password' || field === 'avatar' ? (
          <div className="flex-1 flex gap-3">
            <input
              type={type}
              className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
            />
            <button className={saveBtnBase} onClick={() => { onSave(); if (field !== 'password' && field !== 'avatar') toggleEdit(field); }}>
              Save
            </button>
            {field !== 'password' && field !== 'avatar' && (
              <button className="px-4 py-2 rounded-[0.5rem] text-gray-600 dark:text-gray-400 font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => toggleEdit(field)}>
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between p-2.5 bg-transparent border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 rounded-xl transition-colors cursor-pointer" onClick={() => toggleEdit(field)}>
            <span className="text-gray-900 dark:text-gray-100 text-sm">{value || <span className="text-gray-400 italic">Not set</span>}</span>
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  const saveBtnBase =
    "px-5 py-2.5 rounded-[0.5rem] text-white font-semibold bg-blue-500 hover:bg-blue-600 transition-all duration-100 disabled:opacity-60 focus:scale-95 focus:bg-blue-800";

  return loader ? (
    <PageContainer>
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    </PageContainer>
  ) : (
    <PageContainer>
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#0f0f0f] p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Customize Channel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your channel details and profile</p>
        </div>

        {/* Name */}
        <InlineEditField label="Name" value={name} field="name" onChange={(e) => setName(e.target.value)} onSave={saveName} placeholder="Your channel name" />

        {/* Email */}
        <InlineEditField label="Email" value={email} type="email" field="email" onChange={(e) => setEmail(e.target.value)} onSave={saveEmail} placeholder="name@example.com" />

        {/* Password */}
        <InlineEditField label="New Password" value={password} type="password" field="password" onChange={(e) => setPassword(e.target.value)} onSave={savePassword} placeholder="••••••••" />

        {/* About */}
        <div className="mb-6 group relative">
          <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            About (Channel description)
          </label>
          {editState.about ? (
            <div>
              <textarea
                className="mb-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none block w-full p-3"
                rows={4}
                maxLength={1000}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell viewers about your channel…"
              />
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 rounded-[0.5rem] text-gray-600 dark:text-gray-400 font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => toggleEdit('about')}>
                  Cancel
                </button>
                <button className={saveBtnBase} onClick={() => { saveAbout(); toggleEdit('about'); }}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full p-4 bg-transparent border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 rounded-xl transition-colors cursor-pointer relative" onClick={() => toggleEdit('about')}>
              <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap">{about || <span className="text-gray-400 italic">No description provided.</span>}</p>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="sm:w-32 text-sm font-semibold text-gray-900 dark:text-gray-100">Avatar</label>
          <input
            type="file"
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl p-2.5"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
          />
          <button className={saveBtnBase} onClick={saveAvatar}>
            Save
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => history("/your_channel")}
            className="px-6 py-2.5 rounded-xl text-white dark:text-gray-900 font-medium bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

export default CustomizeChannel;
