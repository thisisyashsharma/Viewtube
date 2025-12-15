import { useState, useEffect } from "react";
import React from "react";
import logo from "../assets/svg_icons/project.svg";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/authSlice";
import { useSelector } from "react-redux";
import axios from "axios";

function Navbar({ openChange }) {
  const [userdata, setUserData] = useState(null);
  // const [loader, setLoader] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dispatch = useDispatch();

  const toggleSidebar = () => {
    console.log("Sidebar toggle triggered");
    openChange();
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSignOut = () => {
    dispatch(logout());
    console.log("Sign out clicked");
  };

  const authStatus = useSelector((state) => state.auth.status);
  const data = useSelector((state) => state.auth.user);

  useEffect(() => {
    // if (data._id) {
    const fetchUser = async () => {
      try {
        // setLoader(true);
        const response = await axios.get(
          `/api/v1/account/userData/${data._id}`
        );
        const userData = response.data.data;
        setUserData(userData);
        // setLoader(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
    // }
  }, [data]);

  return (
    <>
      <nav className="fixed z-30 w-full bg-white border-b-4 border-gray-100 ">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 ">
          <div className="flex items-center justify-between ">
            <div className="flex items-center justify-start ">
              <button
                onClick={toggleSidebar}
                className="fixed top-1 lg:top-2 left-3 z-40 flex items-center justify-center w-10 h-10 bg-white rounded-xl border-2 border-gray-100 hover:border-gray-200  hover:bg-gray-100 group"
              >
                {/*
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap=""
                    strokeLinejoin=""
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                 </svg>
                 */}

                <img
                  src="/src/assets/svg_icons/menu.svg"
                  alt="Icon"
                  className="fixed-size-icon w-6 h-6"
                />
              </button>

              <a
                className="flex items-center justify-center ml-14 md:mr-24 text-2xl font-bold text-gray-700"
                href="/"
              >
                <img src={logo} className="mr-2.5 h-6" alt="Project Logo" />
                <span>Video Management</span>
              </a>

              <form
                action="#"
                method="get"
                className="hidden lg:block "
                style={{ marginLeft: 200 }}
              >
                <label htmlFor="topbar-search" className="sr-only">
                  Search
                </label>
                <div className="relative m-1 lg:w-96">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    style={{ height: 34 }}
                    name="search"
                    id="topbar-search"
                    className="bg-gray-50 border-2 border-gray-200 text-gray-500 focus:text-gray-900 sm:text-sm rounded-xl hover:border-gray-400 focus:ring-primary-100 focus:border-primary-100 block w-full pl-10 p-2.5"
                    placeholder="Search"
                  />
                </div>
              </form>
            </div>

            {/* Profile dropdown */}
            {authStatus && (
              <div className="relative ml-auto lg:ml-4">
                <button
                  type="button"
                  className="flex text-sm  rounded-full focus:ring-4 focus:ring-blue-300"
                  id="user-menu-button-2"
                  aria-expanded={dropdownVisible}
                  onClick={toggleDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  {userdata ? (
                    <>
                      <img
                        className="w-8 h-8 rounded-full"
                        src={userdata.avatar}
                        alt="User"
                      />
                    </>
                  ) : (
                    <li class="flex items-center">
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          class="w-6 h-6 me-2 text-gray-200 animate-spin fill-black"
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
                        <span class="sr-only">Loading...</span>
                      </div>
                      {/* Preparing your profile */}
                    </li>
                  )}
                </button>
                {dropdownVisible && (
                  <div
                    className="absolute right-0 z-50 mt-2 min-w-80  divide-y divide text-base list-none bg-white  rounded-[1.5rem] shadow-2xl border-4 border-gray-100 "
                    id="dropdown-2"
                  >
                    {userdata ? (
                      <>
                        <div className="p-5 flex  rounded-[1.6rem]">
                          <img
                            className="w-14 h-14 rounded-full"
                            src={userdata.avatar}
                            alt="User"
                          />
                          <div className="flex-1 px-3 mt-1 relative w-full max-w-auto overflow-hidden">
                            <p className="text-sm text-gray-900 mb-2">
                              {userdata.name}
                            </p>
                            <div className="border-2 m-1 mt-2 border-gray-100 "></div>
                            <p className="fixed-size text-sm font-nromal text-gray-900 truncate">
                              {" "}
                              {userdata.email}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>Loading user data...</div>
                    )}
                    <ul className="border-4 border-gray-100"></ul>
                    <ul className="flex-1 align-items py-1 text-sm font-medium text-gray-700">
                      <li>
                        <Link
                          to={"/customize_channel"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 "
                        >
                          <img
                            src="/src/assets/svg_icons/customize_account.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Account
                          </span>
                        </Link>
                      </li>
                      <li
                      className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/videoStudio"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/videostudio.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Video Studio
                          </span>
                        </Link>
                      </li>

                      <li
                      className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/dashboard"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/dashboard.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Dashboard
                          </span>
                        </Link>
                      </li>

                      <li className="my-1 border-2 border-gray-100"></li>
                     <li
                      className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/keyboardShortcut"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/keyboard.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Keyboard Shortcuts
                          </span>
                        </Link>
                      </li>
                     <li
                      className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/settings"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/settings.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Settings
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li
                      className="hover:bg-gray-100"
                      >
                        <Link
                          to={"/help"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95  "
                        >
                          <img
                            src="/src/assets/svg_icons/help.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">Help</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/feedback"}
                          className="flex items-center p-3 px-3 hover:bg-gray-100 focus:scale-95 "
                     
                        >
                          <img
                            src="/src/assets/svg_icons/feedback.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Feedback
                          </span>
                        </Link>
                      </li>
                      <li className="my-1 border-2 border-gray-100"></li>
                      <li
                      className=" focus:bg-red-100 hover:text-red-500 "
                      >
                        <button
                          onClick={handleSignOut}
                          className="block flex items-center p-3 px-3 w-full hover:bg-gray-100 focus:scale-95"
                        >
                          <img
                            src="/src/assets/svg_icons/signout.svg"
                            alt="Icon"
                            className="fixed-size-icon w-5 h-5"
                          />
                          <span className="flex items-center ml-3">
                            Sign out
                          </span>
                        </button>
                      </li>
                      <li
                      className="hover:bg-red-50 focus:bg-red-100 hover:text-red-500 "
                      >
                        <button
                          onClick={toggleDropdown}
                          className="group block flex items-center p-3 px-3 rounded-b-md w-full hover:text-red-600 focus:scale-95 focus:bg-red-100 transition-all duration-100 "
                        >
                          <img
                            src="/src/assets/svg_icons/close.svg"
                            alt="Icon"
                            className="fixed-size-icon w-4 h-4"
                          />
                            <span className="flex items-center ml-4 group-focus:text-red-600 group-focus:bg-red-100 ">
                            Close
                          </span>
                        </button>
                      </li>
                      <li
                      className="m-2"
                      >

                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
