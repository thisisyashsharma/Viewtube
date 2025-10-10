import { useState, useEffect } from "react";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function YourChannel() {
  const data = useSelector((state) => state.auth.user);
  // console.log(data._id);

  const [userdata, setUserData] = useState();
  const [subsCount, setSubsCount] = useState(0); //EU6u3.p4.a1.1ln - Subscribe feature - added a subsCount state

  useEffect(() => {
    if (data._id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `/api/v1/account/userData/${data._id}`
          );
          setUserData(response.data.data);
          //EU6u3.p4.a2.4ln - Subscribe feature : fetch subscriber count and yes, called [data._id] as dependency ,
          const st = await axios.get(
            `/api/v1/account/subscribe/status/${data._id}`
          );
          setSubsCount(st.data.data.count || 0);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUser();
    }
  }, [data._id]);

  // console.log(userdata);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  // console.log(formatDate);

  return (
    <>
      <div className="lg:mt-8 bg-white grid grid-cols-1 px-8 pt-6 xl:grid-cols-3 xl:gap-4  ">
        <div className="mb-4 col-span-full xl:mb-2">
          {/*-------------------content---------------------  */}
          {/* <div className='mb-4' >YourChannel</div> */}
          {/* <hr /> */}
          <div class="mt-4 flex items-center gap-5">
            {userdata ? (
              <>
                <img
                  class="w-28 h-28 rounded-full"
                  src={userdata.avatar}
                  alt="not found"
                />
                <div class="font-bold dark:text-black">
                  <div className="text-lg">
                    {(userdata.name || "Admin").toUpperCase()}
                  </div>
                  {/*  //EU6u3.p4.a3.6ln - Subscribe feature: added UI that shows no. of subs */}

                  <div className="text-sm mb-1 text-gray-500">
                    Joined in {formatDate(userdata.createdAt)}
                  </div>
                  <div className="text-sm mb-3 text-gray-900 font-medium">
                    {(subsCount ?? 0).toLocaleString()} subscribers
                  </div>

                  <Link to={"/customize_channel"}>
                    <button
                      type="button"
                      className=" text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-2.5 py-2.5 me-2 "
                    >
                      Customize channel
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <div>Loading user data...</div>
            )}
          </div>
          {/* --------------------------------tab-------------------------------- */}

          <div className="border-b-4 border-gray-200">
            <ul className="flex flex-wrap-mb-px text-md font-medium text-center text-gray-400 transition-all duration-500ms">
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-700 hover:border-gray-700 focus:border-gray-500 focus:text-gray-900"
                >
                  Home
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={"upload_video"}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-700 hover:border-gray-700 focus:border-gray-500 focus:text-gray-900"
                >
                  Videos
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4  border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-700 focus:border-gray-700 focus:text-gray-900"
                >
                  Shorts
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-600 hover:border-gray-700 focus:border-gray-700 focus:text-gray-900"
                >
                  Live
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-600 hover:border-gray-700 focus:border-gray-700 focus:text-gray-900"
                >
                  Podcasts
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-600 hover:border-gray-700 focus:border-gray-700 focus:text-gray-900"
                >
                  Playlists
                </Link>
              </li>
              <li className="me-0">
                <Link
                  to={""}
                  className="inline-flex items-center justify-center p-4 border-b-4 border-transparent  rounded-t-lg hover:text-gray-600 hover:border-gray-700 focus:border-gray-700 focus:text-gray-900"
                >
                  Post
                </Link>
              </li>
            </ul>
          </div>

          {/* --------------------------------tab-------------------------------- */}
          {/* <hr className='mt-4' /> */}

          <Outlet />

          {/*-------------------content---------------------  */}
        </div>
      </div>
    </>
  );
}

export default YourChannel;
