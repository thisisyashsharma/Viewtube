import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { LineDrawIcon } from "./common";

function Sidebar({
  isOpen,
  onClose,
  hidden,
  width = 208,
  onWidthChange,
  isDragging = false,
  setIsDragging,
}) {
  const authStatus = useSelector((state) => state.auth.status);
  const activeState = isOpen !== undefined ? isOpen : hidden;

  // Handle Escape key press to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeState && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeState, onClose]);

  // Horizontal Drag Resize Logic for the Right Border
  const handleStartResize = (e) => {
    e.preventDefault();
    if (setIsDragging) setIsDragging(true);

    const handleMove = (moveEvent) => {
      const clientX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const minW = 160;
      const maxW = Math.min(480, Math.floor(window.innerWidth * 0.6));
      const newWidth = Math.max(minW, Math.min(clientX, maxW));
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    };

    const handleEnd = () => {
      if (setIsDragging) setIsDragging(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd);
  };

  const navItems = [
    {
      name: "Home",
      path: "home",
      iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      active: true,
    },
    {
      name: "Short Form",
      path: "/your_channel",
      iconPath: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      active: authStatus,
    },
    {
      name: "Signup",
      path: "/signup",
      iconPath: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
      active: !authStatus,
    },
    {
      name: "Login",
      path: "/login",
      iconPath: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
      active: !authStatus,
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden ${
          activeState
            ? "opacity-100 pointer-events-auto z-[var(--z-backdrop,40)]"
            : "opacity-0 pointer-events-none -z-10"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar drawer */}
      <aside
        id="sidebar"
        style={{ width: `${width}px` }}
        className={`fixed top-0 left-0 z-[var(--z-drawer,50)] lg:z-20 flex flex-col flex-shrink-0 h-full pt-16 font-semibold text-[1rem] text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl border-r-[0.35rem] border-gray-200/80 dark:border-gray-800/80 shadow-glass ${
          isDragging ? "" : "transition-[transform,width] duration-300 ease-in-out"
        } ${activeState ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Sidebar"
      >
        {/* Horizontal draggable resize handle along right border */}
        <div
          onMouseDown={handleStartResize}
          onTouchStart={handleStartResize}
          className={`absolute top-0 -right-[0.35rem] w-3.5 h-full cursor-col-resize select-none touch-none z-30 flex items-center justify-center transition-colors ${
            isDragging ? "bg-blue-500/20" : "hover:bg-blue-500/10"
          }`}
          title="Drag to resize sidebar width"
        >
          <div
            className={`w-[3px] h-10 rounded-full transition-opacity duration-200 ${
              isDragging
                ? "bg-blue-500 opacity-100"
                : "bg-gray-400 dark:bg-gray-500 opacity-0 group-hover:opacity-100"
            }`}
          />
        </div>
        <div className="relative flex flex-col flex-1 pt-0 bg-transparent border-4 border-transparent">
          <div className="flex flex-col flex-1 pt-2 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1 bg-transparent">
              <ul>
                {navItems.map((item, index) =>
                  item.active ? (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path={item.iconPath}
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">{item.name}</span>
                      </Link>
                    </li>
                  ) : null
                )}

                {authStatus && (
                  <>
                    <li className="my-2 border-b-[3px] border-gray-200/60 dark:border-gray-800/60 rounded-full list-none"></li>
                    <li>
                      <Link
                        to={"/subscriptions"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Subscriptions</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/your_channel"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Your Channel</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/history"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">History</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/like"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Likes</span>
                      </Link>
                    </li>
                    <li className="my-2 border-b-[3px] border-gray-200/60 dark:border-gray-800/60 rounded-full list-none"></li>
                    <li>
                      <Link
                        to={"trending"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Trending</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/Home"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Long Form</span>
                      </Link>
                    </li>
                    <li className="my-2 border-b-[3px] border-gray-200/60 dark:border-gray-800/60 rounded-full list-none"></li>
                    <li>
                      <Link
                        to={"/settings"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Settings</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/customize_channel"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Custom Account</span>
                      </Link>
                    </li>
                    <li className="my-2 border-b-[3px] border-gray-200/60 dark:border-gray-800/60 rounded-full list-none"></li>
                    <li>
                      <Link
                        to={"/reportHistory"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Report History</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/help"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Help</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={"/feedback"}
                        className="flex items-center p-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors"
                      >
                        <LineDrawIcon
                          path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          className="w-5 h-5 flex-shrink-0"
                          baseColor="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          activeColor="text-gray-900 dark:text-gray-100"
                        />
                        <span className="ml-4">Send Feedback</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
