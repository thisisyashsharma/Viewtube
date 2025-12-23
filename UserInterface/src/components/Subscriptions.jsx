//EU6u4.p3.a1.69ln -  Subscribed Channels: build this subscribed page
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton.jsx";

function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get("/api/v1/account/subscriptions");
      setChannels(res.data.data.channels || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="lg:m-0 bg-white grid grid-cols-1 px-8 pt-1 xl:grid-cols-3 xl:gap-4  ">
      <div className="mb-4 col-span-full xl:mb-2  ">
        <div className="m-4 p-6 max-w-4xl mx-auto  ">
          <div className="text-lg mb-6 ">
            <h1 className="text-4xl font-semibold m-4">All Subscription</h1>
          </div>
          <ul className="space-y-7  ">
            {channels.map((ch) => (
              <li
                key={ch._id}
                // className="flex items-center justify-between w-[100%]  rounded-[10rem] border-4 border-gray-100 gap-3 p-2  "
                className="flex flex-col sm:flex-row items-center sm:items-center gap-3 w-[100%] rounded-[10rem] border-4 sm:border-gray-100 border-white p-2"
              >
                <Link
                  to={`/channel/${ch._id}`}
                  className="flex items-center gap-3 sm:items-center flex-1 min-w-0"
                >
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-medium">{ch.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      @{ch.username ?? "-"} <span>{" • "}</span>
                      {ch.subscribersCount.toLocaleString()} subscribers
                    </div>
                    <div
                      className="text-xs text-gray-600 mt-0.5 overflow-hidden text-ellipsis"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {ch.about || "-"}
                    </div>
                  </div>
                </Link>
                <div className="flex-shrink-0 font-semibold">
                  <SubscribeButton
                    channelId={ch._id}
                    defaultSubscribed={true}
                    // defaultCount={ch.subscribersCount}
                  />
                </div>
              </li>
            ))}
            {channels.length === 0 && (
              <li className="text-sm text-gray-500">
                You haven’t subscribed to any channels yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;
