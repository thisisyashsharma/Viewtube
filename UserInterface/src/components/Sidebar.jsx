import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ isOpen, onClose, hidden }) {
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

  const navItems = [
    {
      name: "Home",
      path: "home",
      svg: (
        <img
          src="/svg_icons/home.svg"
          alt="Icon"
          className="fixed-size-icon w-6 h-6"
        />
      ),
      active: true,
    },
    {
      name: "Short Form",
      path: "/your_channel",
      svg: (
        <img
          src="/svg_icons/shorts.svg"
          alt="Icon"
          className="fixed-size-icon w-6 h-6"
        />
      ),
      active: authStatus,
    },
    {
      name: "Signup",
      path: "/signup",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      active: !authStatus,
    },
    {
      name: "Login",
      path: "/login",
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      ),
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
        className={`fixed top-0 left-0 z-[var(--z-drawer,50)] lg:z-20 flex flex-col flex-shrink-0 w-52 h-full pt-14 font-semibold text-[1rem] text-gray-900 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-glass transition-transform duration-300 ease-in-out ${
          activeState ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar"
      >

          <div className="relative flex flex-col flex-1 pt-5 pt-0 bg-transparent border-4 border-transparent">
            <div className="flex flex-col flex-1 pt-2 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1 bg-transparent divide-y divide-gray-200/50">
                <ul className="">
                  {navItems.map((item, index) =>
                    item.active ? (
                      <li key={index}>
                        <Link
                          to={item.path}
                          className="flex items-center p-2 px-3    rounded-xl hover:bg-gray-100 group "
                        >
                          {item.svg}
                          <span className="ml-4">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ) : null
                  )}

                  {authStatus && (
                    <>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li>
                        <Link
                          to={"/subscriptions"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group "
                        >
                           
                          <img
                            src="/svg_icons/subscription.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Subscriptions
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/your_channel"}
                          className="flex items-center p-2 px-3   rounded-xl hover:bg-gray-100 group "
                        >
                        
                          <img
                            src="/svg_icons/your_channel.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Your Channel
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/history"}
                          className="flex items-center p-2 px-3   rounded-xl hover:bg-gray-100 group "
                        >
                          
                          <img
                            src="/svg_icons/history.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                            />
                          <span className="ml-4">
                            History
                          </span>
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to={"/playlist"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                         
                          <img
                            src="/svg_icons/playlist.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Playlist
                          </span>
                        </Link>
                      </li> */}

                      <li>
                        <Link
                          to={"/like"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                        
                          <img
                            src="/svg_icons/likes.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Likes
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li>
                        <Link
                          to={"trending"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                        
                          <img
                            src="/svg_icons/trending.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Trending
                          </span>
                        </Link>
                      </li>

                      {/* <li>
                        <Link
                          to={"home"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                          
                          <img
                            src="/svg_icons/music.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4">
                            Music
                          </span>
                        </Link>
                      </li> */}

                      <li>
                        <Link
                          to={"/Home"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                          <img
                            src="/svg_icons/longForm.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4 flex items-center ml-4">
                            Long Form
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li>
                        <Link
                          to={"/settings"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                          
                          <img
                            src="/svg_icons/settings.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4 flex items-center ml-4">
                            Settings
                          </span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          to={"/customize_channel"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                          <img
                            src="/svg_icons/customize_account.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="flex items-center ml-4 ">
                            Custom Account
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li>
                        <Link
                          to={"/reportHistory"}
                          className="flex items-center p-2 px-3  rounded-xl hover:bg-gray-100 group focus:scale-[0.95]"
                        >
                          <img
                            src="/svg_icons/flag.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="flex items-center ml-4">
                            Report History
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/help"}
                          className="flex items-center p-2 px-3   rounded-xl hover:bg-gray-100 group"
                        >
                          <img
                            src="/svg_icons/help.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4 flex items-center ">Help</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/feedback"}
                          className="flex items-center p-2 px-3    rounded-xl hover:bg-gray-100 group"
                        >
                          <img
                            src="/svg_icons/feedback.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4 flex items-center">
                            Send Feedback
                          </span>
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </aside>
     
      {/* </div> */}
    </>
  );
}

export default Sidebar;
