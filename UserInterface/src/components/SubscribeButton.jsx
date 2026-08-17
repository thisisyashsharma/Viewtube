import React, { useState } from "react";
import axios from "axios";
import { LineDrawIcon } from "./common";

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
    if (busy) return;

    let idStr = "";
    if (!channelId) {
      console.warn("SubscribeButton: no channelId provided, skip toggle");
      return;
    } else if (typeof channelId === "object") {
      idStr = channelId._id || channelId.id || "";
    } else {
      idStr = String(channelId);
    }

    const maybeObjectId = /^[a-fA-F0-9]{24}$/.test(idStr);
    if (!maybeObjectId) {
      console.warn("SubscribeButton: invalid channelId format, skipping API call:", idStr);
      return;
    }

    try {
      setBusy(true);
      const res = await axios.put(`/api/v1/account/subscribe/${encodeURIComponent(idStr)}`);
      const { subscribed: s, count: c } = res?.data?.data || {};
      setSubscribed(!!s);
      if (typeof c === "number") setCount(c);
      onChange && onChange(!!s, c);
    } catch (e) {
      console.error("Subscribe toggle failed:", e?.response?.data || e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-[2rem] overflow-hidden border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
      aria-pressed={subscribed}
      title={subscribed ? "Unsubscribe" : "Subscribe"}
    >
      {/* animated left→right fill */}
      <span
        className={`absolute top-0 bottom-0 left-0 z-0 transition-[width] duration-500 ${
          subscribed
            ? "w-full bg-gradient-to-r from-gray-700 dark:from-gray-300 to-gray-700 dark:to-gray-300"
            : "w-0 bg-gradient-to-r from-gray-700 dark:from-gray-300 to-gray-700 dark:to-gray-300"
        }`}
      />
      <div className="relative ml-2 z-10 h-5 w-5 flex items-center justify-center">
        {subscribed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-white dark:text-gray-900 transition-colors"
          >
            <path
              fillRule="evenodd"
              d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <LineDrawIcon
            path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            className="h-5 w-5"
            baseColor="text-gray-600 dark:text-gray-400"
            activeColor="text-gray-900 dark:text-gray-100"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          />
        )}
      </div>
      <span
        className={`relative z-10 transition-colors ${
          subscribed ? "text-white dark:text-gray-900 font-semibold" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {subscribed ? "Subscribed" : "Subscribe"}
      </span>
      {typeof count === "number" && count >= 0 && (
        <span
          className={`relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
            subscribed ? "text-white/90 dark:text-gray-900/90 bg-white/20 dark:bg-gray-900/20" : "text-gray-600 dark:text-gray-400 bg-gray-200/80 dark:bg-gray-800/80"
          }`}
        >
          {count}
        </span>
      )}
    </button>

  );
}

export default SubscribeButton;
