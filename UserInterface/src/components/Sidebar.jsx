import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ hidden }) {
  const authStatus = useSelector((state) => state.auth.status);
  // console.log(authStatus);

  const navItems = [
    {
      name: "Home",
      path: "home",
      svg: (
        /* <svg
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
             d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
           />
         </svg>
        */
        <img
          src="/src/assets/svg_icons/home.svg"
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
        /*
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
        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
        />
        </svg>
        */
        <img
          src="/src/assets/svg_icons/shorts.svg"
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
        /**/
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
  // console.log(hidden);
  return (
    <>
      {/* {{ sidebar }} */}
     
        <aside
          id="sidebar"
        className={`
  fixed top-0 lg:top-5 left-0 z-20
  flex flex-col flex-shrink-0 w-57 h-full pt-10
  font-semibold text-[1rem] text-gray-900 lg:flex

  transform
  transition-transform transition-opacity
  duration-900 ease-in-out

  ${hidden ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
`}

       
          aria-label="Sidebar"
        >
          <div className="relative flex flex-col flex-1 pt-5 pt-0 bg-white border-4 border-gray-100  ">
            <div className="flex flex-col flex-1 pt-2 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200 ">
                <ul className="">
                  {navItems.map((item, index) =>
                    item.active ? (
                      <li key={index}>
                        <Link
                          to={item.path}
                          className="flex items-center p-2 px-3    rounded-xl hover:bg-gray-100 group "
                        >
                          {item.svg}
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/subscription.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/your_channel.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/history.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                            />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/playlist.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/likes.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/trending.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/music.svg"
                            alt="Icon"
                            className="fixed-size-icon w-6 h-6"
                          />
                          <span className="ml-4" sidebar-toggle-item>
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
                            src="/src/assets/svg_icons/longForm.svg"
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
                            src="/src/assets/svg_icons/settings.svg"
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
                            src="/src/assets/svg_icons/customize_account.svg"
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
                            src="/src/assets/svg_icons/flag.svg"
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
                            src="/src/assets/svg_icons/help.svg"
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
                            src="/src/assets/svg_icons/feedback.svg"
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
