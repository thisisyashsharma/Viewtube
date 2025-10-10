import React, { useState } from "react";
import axios from "axios";

function SubscribeButton({
  channelId,
  defaultSubscribed = false,
  defaultCount = 0,
  onChange, // optional callback (subscribed, count) for parent updates
}) {
  const [subscribed, setSubscribed] = useState(defaultSubscribed);
  const [count, setCount] = useState(defaultCount);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!channelId || busy) return;
    try {
      setBusy(true);
      const res = await axios.put(`/api/v1/account/subscribe/${channelId}`);
      const { subscribed: s, count: c } = res?.data?.data || {};
      setSubscribed(!!s);
      if (typeof c === "number") setCount(c);
      onChange && onChange(!!s, c);
    } catch (e) {
      console.error("Subscribe toggle failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-[2rem] overflow-hidden border-2 border-gray-300 hover:bg-gray-100 "
      aria-pressed={subscribed}
      title={subscribed ? "Unsubscribe" : "Subscribe"}
    >
      {/* animated left→right fill (match your Video.jsx look) */}
      <span
        className={`absolute top-0 bottom-0 left-0 z-0 transition-[width] duration-500  ${
          subscribed
            ? "w-full bg-gradient-to-r from-gray-700 to-gray-700"
            : "w-0 bg-gradient-to-r from-gray-700 to-gray-700"
        }`}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`relative ml-2 z-10 h-5 w-5 ${
          subscribed ? "text-white" : "text-gray-600"
        }`}
      >
        <path
          fillRule="evenodd"
          d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
          clipRule="evenodd"
        />
      </svg>
      <span
        className={`relative z-10 ${
          subscribed ? "text-white" : "text-gray-700"
        }`}
      >
        {subscribed ? "Subscribed" : "Subscribe"}
      </span>
      <span
        className={`relative z-10 rounded-full px-2 py-0.5 ${
          subscribed ? "text-white bg-white/0 " : "text-gray-600 px-3"
        }`}
      >
        {/* {typeof count === "number" ? count : ""} */}
      </span>
    </button>
  );
}

export default SubscribeButton;
