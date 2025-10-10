import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function CustomizeChannel() {
  const data = useSelector((state) => state.auth.user);
  const history = useNavigate();

  const [loader, setLoader] = useState(false);
  const [file, setFile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");

  // do NOT prefill password (prevents weird autofill/hashed values showing)
  const [password, setPassword] = useState("");

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
  const savePassword = () => {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    updateField({ password }).then(() => setPassword(""));
  };
  const saveAvatar = () => {
    if (!file) {
      alert("Choose an image first.");
      return;
    }
    updateField({ avatar: file }).then(() => setFile(null));
  };

  const inputBase =
    "p-2 border-b-2 text-gray-400 focus:text-gray-900 focus:border-blue-500 hover:border-gray-800 focus:bg-gray-100 outline-none transition-all duration-500 rounded-t-md";
  const saveBtnBase =
    "px-5 py-2.5 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-60";

  return loader ? (
    <div className="text-center my-72">
      <div className="p-4 text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin fill-black"
            viewBox="0 0 100 101"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </div>
    </div>
  ) : (
    <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4">
      <div className="mb-4 col-span-full xl:mb-2">
        <div className="text-lg mb-8">
          <h1 className="text-4xl font-semibold">Customize Channel</h1>
        </div>

        {/* Name */}
        <div className="mb-6 flex items-center gap-2 max-w-3xl">
          <label className="w-40 text-sm font-medium text-gray-900">Name</label>
          <input
            type="text"
            className={`${inputBase} flex-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your channel name"
          />
          <button className={saveBtnBase} onClick={saveName}>
            Save
          </button>
        </div>

        {/* Email */}
        <div className="mb-6 flex items-center gap-2 max-w-3xl">
          <label className="w-40 text-sm font-medium text-gray-900">Email</label>
          <input
            type="email"
            className={`${inputBase} flex-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          <button className={saveBtnBase} onClick={saveEmail}>
            Save
          </button>
        </div>

        {/* Password */}
        <div className="mb-6 flex items-center gap-2 max-w-3xl">
          <label className="w-40 text-sm font-medium text-gray-900">
            New Password
          </label>
          <input
            type="password"
            className={`${inputBase} flex-1`}
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button className={saveBtnBase} onClick={savePassword}>
            Save
          </button>
        </div>

        {/* About */}
        <div className="mb-6 max-w-3xl">
          <label className="block mb-1 text-sm font-medium text-gray-900">
            About (Channel description)
          </label>
          <textarea
            className="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            rows={4}
            maxLength={1000}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell viewers about your channel…"
          />
          <button className={saveBtnBase} onClick={saveAbout}>
            Save
          </button>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex items-center gap-2 max-w-3xl">
          <label className="w-40 text-sm font-medium text-gray-900">Avatar</label>
          <input
            type="file"
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*"
          />
          <button className={saveBtnBase} onClick={saveAvatar}>
            Save
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => history("/your_channel")}
            className="px-5 py-2.5 rounded text-white bg-gray-700 hover:bg-black transition-all duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizeChannel;
