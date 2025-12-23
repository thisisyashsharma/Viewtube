// /mnt/data/Feedback.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Feedback() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // {id, url, name, size}
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null); // inline message
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // transient popup toast (holds message string)
  const [toastVisible, setToastVisible] = useState(false); // controls modal overlay visibility
  const fileInputRef = useRef(null);

  const MAX_FILES = 8; // max number of photos allowed
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB each

  useEffect(() => {
    if (!toast) return;
    // show the visual toast overlay
    setToastVisible(true);

    // auto-hide after 3s
    const id = setTimeout(() => {
      setToastVisible(false);
      setToast(null);
    }, 3000);

    return () => {
      clearTimeout(id);
    };
  }, [toast]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPhotos([]);
    setPreviews([]);
    setProgress(0);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  function makePreview(file) {
    return {
      id: `${file.name}-${file.size}-${Date.now()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    };
  }

  const onFilesChange = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);

    // enforce total count limit
    if (photos.length + incoming.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} photos.`);
      return;
    }

    // validate sizes
    const tooLarge = incoming.find((f) => f.size > MAX_SIZE);
    if (tooLarge) {
      setError(`Each image must be <= ${Math.round(MAX_SIZE / 1024 / 1024)}MB.`);
      return;
    }

    setError(null);
    const newPhotos = [...photos, ...incoming];
    const newPreviews = [...previews, ...incoming.map(makePreview)];
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  const removePhotoByIndex = (index) => {
    setPreviews((p) => p.filter((_, i) => i !== index));
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files;
    onFilesChange(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!title.trim()) return setError("Please add a heading for your feedback.");
    if (!description.trim()) return setError("Please add a description.");

    try {
      setLoading(true);
      setProgress(0);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());

      // append multiple photos with same field name so backend can parse as array
      photos.forEach((file) => fd.append("photos[]", file));

      const res = await axios.post("/api/v1/feedback", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (p) => {
          if (p.total) setProgress(Math.round((p.loaded / p.total) * 100));
        },
      });

      const successMessage = res?.data?.message || "Feedback sent — thanks!";
      setMessage(successMessage);
      setToast(successMessage); // triggers modal toast overlay
      resetForm();
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to send feedback.";
      setError(errMsg);
      // show a small failure toast as modal too
      setToast(errMsg);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Manually close toast (used by close button or overlay click)
  const closeToast = () => {
    setToastVisible(false);
    setToast(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl relative">
        {/* Modal-style centered toast overlay (renders when toastVisible true) */}
        {toastVisible && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            onClick={closeToast} // clicking anywhere on the backdrop closes
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Toast card */}
            <div
              className="relative z-10 max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl border p-6 transform transition-all"
              onClick={(e) => e.stopPropagation()} // prevent backdrop click when clicking inside the card
            >
              {/* Close button */}
              <button
                onClick={closeToast}
                aria-label="Close notification"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">
                {/* Tick icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{toast}</div>
                  <div className="text-xs text-gray-500 mt-1">Thanks — we received your feedback.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border-4 border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Feedback</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of feedback"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  maxLength={120}
                />
                <div className="text-xs text-gray-400 mt-1">{title.length}/120</div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Attach photos (optional)</label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl hover:border-blue-400 transition cursor-pointer bg-white"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onFilesChange(e.target.files)}
                    className="hidden"
                  />

                  <div className="text-center py-4">
                    <div className="text-gray-500">Drag & drop images here, or click to choose</div>
                  </div>
                </div>

                {/* Thumbnails */}
                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
                    {previews.map((pr, i) => (
                      <div key={pr.id} className="relative">
                        <img src={pr.url} alt={pr.name} className="w-full h-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removePhotoByIndex(i)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-gray-600 border"
                          aria-label={`Remove ${pr.name}`}
                        >
                          ✕
                        </button>
                        <div className="text-xs truncate mt-1">{pr.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your feedback here..."
                rows={6}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                maxLength={5000}
              />
              <div className="text-xs text-gray-400 mt-1">{description.length}/5000</div>
            </div>

            {loading && (
              <div className="w-full bg-gray-100 rounded overflow-hidden h-3">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${progress}%` }} />
              </div>
            )}

            {message && <div className="text-green-600 font-medium">{message}</div>}
            {error && <div className="text-red-600 font-medium">{error}</div>}

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {loading ? `Sending… ${progress}%` : "Send Feedback"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  disabled={loading}
                >
                  Reset
                </button>
              </div>

              <div className="text-xs text-gray-400">We’ll review your feedback.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
