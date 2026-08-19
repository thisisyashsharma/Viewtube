import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SubscribeButton({
  channelId,
  subscribed: controlledSubscribed,
  subsCount,
  defaultSubscribed = false,
  defaultCount = 0,
  onRequireAuth,
  onChange,
  className = "",
}) {
  const isControlled = typeof controlledSubscribed === "boolean";
  const [subscribed, setSubscribed] = useState(
    isControlled ? controlledSubscribed : defaultSubscribed
  );
  const [count, setCount] = useState(subsCount ?? defaultCount);
  const [busy, setBusy] = useState(false);
  const [showFloater, setShowFloater] = useState(false);
  const [drawKey, setDrawKey] = useState(0);

  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    if (isControlled) {
      setSubscribed(controlledSubscribed);
    }
  }, [controlledSubscribed, isControlled]);

  useEffect(() => {
    if (typeof subsCount === "number") {
      setCount(subsCount);
    }
  }, [subsCount]);

  const toggle = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (onRequireAuth && !onRequireAuth()) return;
    if (busy) return;

    let idStr = "";
    if (!channelId) {
      console.warn("SubscribeButton: no channelId provided");
      return;
    } else if (typeof channelId === "object") {
      idStr = channelId._id || channelId.id || "";
    } else {
      idStr = String(channelId);
    }

    try {
      setBusy(true);
      const res = await axios.put(
        `/api/v1/account/subscribe/${encodeURIComponent(idStr)}`
      );
      const s = res?.data?.data?.subscribed ?? !subscribed;
      const c = res?.data?.data?.count;

      setSubscribed(s);
      if (typeof c === "number") {
        setCount(c);
      }

      if (s) {
        setShowFloater(true);
        setShowSparks(true);
        setDrawKey((prev) => prev + 1);
        setTimeout(() => setShowFloater(false), 950);
        setTimeout(() => setShowSparks(false), 600);
      }

      onChange &&
        onChange(
          s,
          typeof c === "number"
            ? c
            : s
            ? count + 1
            : Math.max(0, count - 1)
        );
    } catch (err) {
      console.error("Subscribe toggle failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Super Smooth Tactile Pop & Float "+1" Badge */}
      {showFloater && (
        <span
          key={`floater-${drawKey}`}
          className="pointer-events-none absolute -top-3 right-3 z-30 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-black text-blue-600 dark:text-blue-400 bg-white/95 dark:bg-[#181818]/95 shadow-[0_4px_14px_rgba(37,99,235,0.25)] border border-blue-500/30 backdrop-blur-md select-none"
          style={{
            animation:
              "vtPopAndFloat 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <span className="leading-none tracking-tight">+1</span>
        </span>
      )}

      {/* Micro Spark Celebration Pips (Zero Scale) */}
      {showSparks && (
        <div key={`sparks-${drawKey}`} className="pointer-events-none absolute inset-0 z-20">
          <span
            className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"
            style={{ animation: "vtSparkTL 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]"
            style={{ animation: "vtSparkTR 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute bottom-1 left-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]"
            style={{ animation: "vtSparkBL 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
          <span
            className="absolute bottom-1 right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
            style={{ animation: "vtSparkBR 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={subscribed}
        className={`relative inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-full min-h-[38px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-[0.5px] cursor-pointer overflow-hidden shadow-2xs group ${
          subscribed
            ? "bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 hover:bg-gray-200/80 dark:hover:bg-[#282828] hover:border-gray-300 dark:hover:border-white/20"
            : "bg-gray-950 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 font-bold border border-transparent hover:shadow-[0_0_14px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_14px_rgba(255,255,255,0.2)]"
        } ${className}`}
      >
        {/* Draw-Check SVG Icon sliding in smoothly */}
        <span
          className="inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            maxWidth: subscribed ? "18px" : "0px",
            opacity: subscribed ? 1 : 0,
            marginRight: subscribed ? "4px" : "0px",
          }}
        >
          {subscribed && (
            <svg
              key={drawKey}
              className="w-3.5 h-3.5 text-current shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.75}
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: 0,
                  animation:
                    "vtDrawCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards",
                }}
              />
            </svg>
          )}
        </span>

        {/* Magnetic Word Change: 'Subscribe' seamlessly forms into 'Subscribed' */}
        <span className="inline-flex items-center font-[inherit] select-none tracking-tight">
          <span>Subscribe</span>
          <span
            className="inline-block overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              maxWidth: subscribed ? "1.5ch" : "0ch",
              opacity: subscribed ? 1 : 0,
              transform: subscribed ? "translateY(0)" : "translateY(-6px)",
            }}
          >
            d
          </span>
        </span>
      </button>

      <style>{`
        @keyframes vtDrawCheck {
          0% {
            stroke-dashoffset: 24;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes vtPopAndFloat {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(2px);
          }
          15% {
            opacity: 1;
            transform: translateY(-4px);
            filter: blur(0px);
          }
          30% {
            transform: translateY(-8px);
          }
          70% {
            opacity: 1;
            transform: translateY(-18px);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-28px);
            filter: blur(3px);
          }
        }
        @keyframes vtSparkTL {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-14px, -12px);
          }
        }
        @keyframes vtSparkTR {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(14px, -12px);
          }
        }
        @keyframes vtSparkBL {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-14px, 12px);
          }
        }
        @keyframes vtSparkBR {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(14px, 12px);
          }
        }
      `}</style>
    </div>
  );
}
