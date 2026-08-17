import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageContainer from "./layout/PageContainer";


export default function ReportForm() {
  const { id: videoId } = useParams(); // video id from route /report/:id
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("inappropriate");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // file objects
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const MAX_FILES = 6;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  function mkPreview(file) {
    return { id: `${file.name}-${file.size}-${Date.now()}`, url: URL.createObjectURL(file), name: file.name };
  }

  const onFiles = (fileList) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    if (photos.length + incoming.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} images.`);
      return;
    }
    const tooBig = incoming.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`Each image must be ≤ ${Math.round(MAX_SIZE / 1024 / 1024)}MB.`);
      return;
    }
    setError(null);
    setPhotos((p) => [...p, ...incoming]);
    setPreviews((p) => [...p, ...incoming.map(mkPreview)]);
  };

  const removePreview = (index) => {
    setPreviews((p) => p.filter((_, i) => i !== index));
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const onDrop = (e) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

// update in ReportForm.jsx -> handleSubmit
const handleSubmit = (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (!title.trim()) return setError("Please add a short heading for the report.");
  if (!description.trim()) return setError("Please describe the issue.");

  const payload = {
    _id: `local_${Date.now()}`, // temporary id
    videoId,
    videoTitle: document.title || "Untitled", // optional, replace with real title if you have it
    title: title.trim(),
    reason: title.trim(),
    category,
    description: description.trim(),
    photosCount: photos.length,
    previews: previews.map(p => ({ url: p.url, name: p.name })), // helpful for UI
    status: "open",
    createdAt: new Date().toISOString()
  };

  // save to localStorage (append)
  const existing = JSON.parse(localStorage.getItem("local_reports") || "[]");
  existing.unshift(payload); // newest first
  localStorage.setItem("local_reports", JSON.stringify(existing));

  console.log("REPORT PAYLOAD saved locally:", payload);
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSuccess("Report saved locally — it will appear in Report History.");
    // navigate to report history page
    navigate("/reportHistory");
  }, 600);
};

  return (

    <PageContainer>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#0f0f0f] rounded-3xl shadow-sm p-4 sm:p-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Report video</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Video ID: <span className="font-mono text-xs">{videoId}</span></p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-900 dark:text-gray-100">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title of the issue"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                maxLength={140}
              />
              <div className="text-xs text-gray-400 mt-1">{title.length}/140</div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-900 dark:text-gray-100">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none">
                <option value="inappropriate">Inappropriate content</option>
                <option value="copyright">Copyright</option>
                <option value="spam">Spam / Misleading</option>
                <option value="privacy">Privacy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-900 dark:text-gray-100">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's wrong with the video. Include timestamps if helpful."
                rows={5}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none focus:ring-2 focus:ring-blue-600 focus:outline-none"
                maxLength={4000}
              />
              <div className="text-xs text-gray-400 mt-1">{description.length}/4000</div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2 text-gray-900 dark:text-gray-100">Attach photos (optional)</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current && fileRef.current.click()}
                className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onFiles(e.target.files)}
                  className="hidden"
                />
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Drag & drop images here or click to choose</div>
              </div>

              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((p, i) => (
                    <div key={p.id} className="relative">
                      <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded-xl" />
                      <button type="button" onClick={() => removePreview(i)} className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow text-gray-600 dark:text-gray-400 border dark:border-gray-700">✕</button>
                      <div className="text-xs dark:text-gray-300 truncate mt-1">{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="text-sm font-medium text-red-600">{error}</div>}
            {success && <div className="text-sm font-medium text-green-600">{success}</div>}


            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit report"}
                </button>
                <button
                  type="button"
                  onClick={() => { setTitle(""); setCategory("inappropriate"); setDescription(""); setPhotos([]); setPreviews([]); fileRef.current && (fileRef.current.value = ""); setError(null); setSuccess(null); }}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  Reset
                </button>
              </div>

              <div className="text-xs text-gray-400">Your report will be reviewed by moderators.</div>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

