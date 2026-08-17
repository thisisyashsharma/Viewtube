import React, { useState, useEffect } from "react";
import axios from "axios";
import { getThumbnailUrl } from "../utils/thumbnail.utils";

function EditVideoModal({ video, isOpen, onClose, onUpdateSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title || "");
      setDescription(video.description || "");
      setThumbnailPreview(getThumbnailUrl(video));
      setThumbnail(null);
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      setLoader(true);
      const res = await axios.put(
        `/api/v1/videos/update/${video._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          timeout: 120000,
        }
      );

      const updatedVideo = res.data?.data || res.data;
      alert("Successfully Updated Video Details");
      setLoader(false);
      onUpdateSuccess && onUpdateSuccess(updatedVideo);
      onClose();
    } catch (error) {
      console.error("Video Update Error: ", error);
      alert(error?.response?.data?.message || "Something went wrong while updating video.");
      setLoader(false);
    }
  };

  return (
    <div
      id="crud-modal"
      onClick={(e) => {
        if (e.target.id === "crud-modal") onClose();
      }}
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/50 backdrop-blur-sm p-3 sm:p-6"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#0f0f0f] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Modal Header matching UploadVideo */}
        <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Video Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:scale-95 transition-all rounded-full p-2"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Modal Form matching UploadVideo */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid gap-4 mb-4 grid-cols-2 text-[0.9rem]">
            {/* TITLE */}
            <div className="col-span-2">
              <label
                htmlFor="title"
                className="block mb-3 font-medium text-gray-900 dark:text-gray-100"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-gray-500 dark:focus:border-gray-400 w-full p-2.5"
                placeholder="Enter video title"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block mb-2 font-medium text-gray-900 dark:text-gray-100"
              >
                Description
              </label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block p-2.5 w-full text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video description"
                required
              ></textarea>
            </div>

            {/* THUMBNAIL DROPZONE & PREVIEW */}
            <div className="col-span-2">
              <label
                htmlFor="thumbnail"
                className="block mb-2 font-medium text-gray-900 dark:text-gray-100"
              >
                Update Thumbnail (Optional)
              </label>
              <div className="flex flex-row gap-4 items-center">
                <label
                  htmlFor="edit-thumbnail-input"
                  className="flex flex-col items-center justify-center w-full h-[7rem] border-[0.2rem] border-dashed border-gray-300 dark:border-gray-700 rounded-[1.4rem] cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus-within:border-blue-500 transition"
                >
                  <div className="flex flex-col items-center justify-center pt-4 pb-5">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      <span className="font-semibold text-blue-600">
                        Click to change image
                      </span>
                    </p>
                  </div>

                  <input
                    type="file"
                    id="edit-thumbnail-input"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>

                {thumbnailPreview && (
                  <div className="relative w-36 h-[7rem] flex-shrink-0">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-[1.4rem] border-2 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON MATCHING UploadVideo */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loader}
              className="w-full text-md text-white dark:text-gray-900 bg-gray-700 dark:bg-gray-100 hover:bg-gray-900 dark:hover:bg-white focus:outline-none focus:scale-95 transition-all duration-100 font-semibold rounded-xl px-7 py-3"
            >
              {loader ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideoModal;
