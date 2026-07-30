import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

function UploadVideo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loader, setLoader] = useState(false);
  const [useLocal, setUseLocal] = useState("local");

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const history = useNavigate();

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleVideoFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("storage", useLocal  ); // <— NEW: toggle
    
    formData.append("thumbnail", thumbnail);
    formData.append("videoFile", videoFile);

    // debug print FormData entries (works in modern browsers)
    for (const pair of formData.entries()) {
      console.log("FormData:", pair[0], pair[1]);
    }

    try {
      setLoader(true);
      const res = await axios.post("/api/v1/videos/publish", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // send cookies (accessToken/refreshToken) to backend
        timeout: 120000, // allow longer time for big uploads
      });

      alert("Successfully Video Uploaded");
      setLoader(false);
      history("/your_channel");
      // console.log(res.data);
    } catch (error) {
      console.log("Video Upload error: ", error);
      alert(" Something went worng ?");
      setLoader(false);
    }
  };

  return loader ? (
    <div className="text-center  my-44 ">
      <div className="p-4 text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin  fill-black"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="text-center">
        <button
          onClick={handleToggleModal}
          type="button"
          className="text-md text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:scale-95 transition-all duration-100 font-semibold rounded-xl   px-7 py-3 me-2 my-6"
        >
          Upload
        </button>
      </div>

      {isModalOpen && (
        <div
          id="crud-modal"
          onClick={(e) => {
            if (e.target.id === "crud-modal") handleToggleModal();
          }}
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black/50 backdrop-blur-sm p-3 sm:p-6"
        >
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="bg-gray-100 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Upload Video
              </h3>
              <button
                type="button"
                onClick={handleToggleModal}
                className="text-gray-500 hover:bg-gray-200 focus:scale-95 transition-all rounded-full p-2"
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">

              <div className="grid gap-4 mb-4 grid-cols-2 text-[0.9rem]">
                <div className="col-span-2">
                  <label
                    htmlFor="title"
                    className="block mb-3 font-medium text-gray-900"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-gray-50 border-2 border-gray-300 text-gray-900  rounded-xl focus:border-gray-500
                     w-full p-2.5"
                    placeholder="Enter video title"
                    required
                  />
                </div>

                {/* DESCRIPTION of the video  */}
                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-2 font-medium text-gray-900"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block p-2.5 w-full  text-gray-900 bg-gray-50 rounded-xl border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter video description"
                    required
                  ></textarea>
                </div>
                {/* THUMBNAIL  */}
                <div className="col-span-2 ">
                  <label
                    htmlFor="thumbnail"
                    className="block mb-2 font-medium text-gray-900"
                  >
                    Thumbnail
                  </label>
                  <div className="flex flex-row gap-9 items-center">
                    <label
                      htmlFor="thumbnail"
                      className="flex flex-col items-center justify-center w-full h-[7rem]
                      border-[0.2rem] border-dashed border-gray-120 rounded-[1.4rem]
                      cursor-pointer bg-gray-50
                      hover:bg-gray-100
                      focus-within:border-blue-500
                      focus-within:ring-2 focus-within:ring-blue-300
                      transition"
                    >
                      <div></div>
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
                            d="M3 5h18M3 19h18M4 5l4 6h8l4-6"
                          />
                        </svg>

                        <p className="text-sm text-gray-500 text-center">
                          <span className="font-semibold text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag
                        </p>
                      </div>

                      <input
                        type="file"
                        name="thumbnail"
                        id="thumbnail"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        required
                      />
                    </label>

                    {/* Thumbnail preview */}
                    {thumbnail && (
                      <div className="relative w-full h-[7.3rem]">
                        <img
                          src={URL.createObjectURL(thumbnail)}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover rounded-[1.4rem] border-[0.4rem]"
                        />
                        <button
                          type="button"
                          onClick={() => setThumbnail(null)}
                          className="
                           w-9 h-9
                          absolute
                          top-3 right-3
                          p-1
                           bg-gray-100 bg-opacity-100 rounded-[0.7rem] 
                          backdrop-blur-[0.5rem]
                          flex justify-center items-center 
                          "
                        >
                          <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video upload button  */}
                <div className="col-span-2">
                  <label
                    htmlFor="videoFile"
                    className="block mb-2 font-medium text-gray-900"
                  >
                    Video
                  </label>
                  <div className="flex flex-row gap-4 items-center">
                    {/* Drag / upload box */}
                    <label
                      htmlFor="videoFile"
                      className="flex flex-col items-center justify-center w-full h-[8rem]
                 border-[0.2rem] border-dashed border-gray-120 rounded-[1.4rem]
                 cursor-pointer bg-gray-50
                 hover:bg-gray-100
                 focus-within:border-blue-500
                 focus-within:ring-2 focus-within:ring-blue-300
                 transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V12M12 16V8M17 16v-4M3 20h18"
                          />
                        </svg>

                        <p className="mb-2 text-sm text-gray-500 text-center">
                          <span className="font-semibold text-blue-600">
                            Click to upload
                          </span>{" "}
                          or drag
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                          MP4, MOV (100MB max)
                        </p>
                      </div>

                      <input
                        type="file"
                        name="videoFile"
                        id="videoFile"
                        onChange={handleVideoFileChange}
                        className="hidden"
                        required
                      />
                    </label>

                    {/* Video preview */}
                    {videoFile && (
                      <div className="relative w-full h-[8.2rem]">
                        <video
                          src={URL.createObjectURL(videoFile)}
                          className="w-full h-full object-cover rounded-[1.4rem] border-[0.4rem]"
                          autoPlay
                          loop
                          muted
                        />
                        <button
                          type="button"
                          onClick={() => setVideoFile(null)}
                          className="
                           w-9 h-9
                          absolute
                          top-3 right-3
                          p-1
                           bg-gray-200 bg-opacity-100 rounded-[0.7rem] 
                          backdrop-blur-[0.5rem]
                          flex justify-center items-center 
                          "
                        >
                          <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* STORAGE TOGGLE */}
                <div className="col-span-2 flex items-center gap-3">
                  <select
                    value={useLocal}
                    onChange={(e) => setUseLocal(e.target.value)}
                    className="border rounded-lg p-2"
                  >
                    <option value="local">Local</option>
                    <option value="cloud">Cloudinary</option>
                    <option value="gcs">Google Cloud</option>
                  </select>

                  <label htmlFor="useLocal" className="  text-gray-700"></label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-7 py-3 text-[1rem] font-medium text-center text-white bg-blue-600 rounded-[1rem] hover:bg-blue-800 hover:ring-4 hover:ring-primary-300 sm:w-auto focus:scale-lg focus:scale-[0.9] transition-transform duration-200
                   flex justify-center items-center 
                   "
              >
                <svg
                  className="me-1 -ms-1 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Upload
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UploadVideo;
