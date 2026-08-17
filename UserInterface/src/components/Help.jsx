import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Responsive Help & FAQ page
 * - Mobile-first styles; expands gracefully on tablet/desktop.
 * - Larger touch targets on mobile, compact layout on desktop.
 * - Each FAQ expands to show step items; each step is independently collapsible.
 *
 * Replace the `faqs` array below with your own content (you said you'd replace it).
 */

const faqs = [
  {
    q: "How do I sign up?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Open the Signup page, fill name/email/password and submit. Verify email if verification is enabled.",
      },
      {
        title: "Step 1 — Open Signup",
        content:
          'Click "Sign up" in the header or sidebar to open the registration form.',
      },
      {
        title: "Step 2 — Fill the form",
        content:
          "• Full name: readable display name.\n• Email: a valid, accessible email address.\n• Password: 8+ characters recommended; include letters and numbers.",
      },
      {
        title: "Step 3 — Submit",
        content:
          'Click "Create account". The app shows success or inline errors (duplicate email, bad password).',
      },
      {
        title: "Step 4 — Verify email (if enabled)",
        content:
          "Check your inbox (and spam). Click the verification link or copy the OTP into the app to finish.",
      },
      {
        title: "Troubleshooting",
        content:
          "If you don't receive verification, retry resend from the UI or check spam. Contact support if the problem persists.",
      },
    ],
  },
  {
    q: "How do I log in?",
    steps: [
      {
        title: "Quick summary",
        content: "Use Login page — enter email and password and submit.",
      },
      {
        title: "Step 1 — Open Login",
        content: 'Click "Login" from the header or sidebar.',
      },
      {
        title: "Step 2 — Enter credentials",
        content: "Type the email you used during signup and your password.",
      },
      {
        title: "Step 3 — Submit and session handling",
        content:
          "Click Login. On success the app stores a session token (cookie or localStorage) and redirects you to the homepage or last page.",
      },
      {
        title: "Troubleshooting",
        content:
          'If you forgot your password use the "Forgot password" flow. If login fails with 2FA enabled, complete 2FA steps.',
      },
    ],
  },
  {
    q: "How do I publish/upload a video?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Open Publish, provide title/desc/thumbnail/video, then publish.",
      },
      {
        title: "Step 1 — Open Publish/Upload",
        content:
          'Select "Publish" or "Upload" from the sidebar or channel menu.',
      },
      {
        title: "Step 2 — Prepare assets",
        content:
          "• Title: short and descriptive.\n• Description: summary, tags, allowed visibility.\n• Thumbnail: JPG/PNG recommended 1280x720.\n• File: use MP4 (H.264/AAC) if possible for best compatibility.",
      },
      {
        title: "Step 3 — Upload",
        content:
          "Pick files (thumbnail + video) and any metadata (category, allow comments). Click Publish and watch upload progress.",
      },
      {
        title: "Step 4 — Post-upload checks",
        content:
          "Confirm server returned success, check the new video appears in All Videos and verify playback and thumbnail display.",
      },
      {
        title: "Troubleshooting & tips",
        content:
          "For large files prefer a stable connection. Consider client chunking/resumable uploads if your environment supports it.",
      },
    ],
  },
  {
    q: "What video formats and codecs are supported?",
    steps: [
      {
        title: "Quick summary",
        content: "MP4 (H.264 + AAC) is the recommended format.",
      },
      {
        title: "Accepted formats",
        content: "MP4 (preferred), WebM (varies), MOV (may need transcoding).",
      },
      {
        title: "If you have playback issues",
        content:
          "Re-encode with ffmpeg or HandBrake. Example ffmpeg command: ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4",
      },
      {
        title: "Server note",
        content:
          "If the server does not transcode automatically, upload already-compatible files to avoid playback problems.",
      },
    ],
  },
  {
    q: "How are thumbnails handled?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Upload thumbnail during publish; it will be stored locally or in cloud and shown on cards.",
      },
      {
        title: "Step 1 — Upload",
        content:
          "Select a thumbnail when publishing a video (recommended 1280x720, 16:9).",
      },
      {
        title: "Step 2 — Storage options",
        content:
          "Local storage: served from public folder. Cloud storage: uploaded to provider (e.g., Cloudinary/S3) and URL stored in DB.",
      },
      {
        title: "Best practices",
        content:
          "Keep file size under ~500KB and use 16:9 ratio for consistent layout.",
      },
    ],
  },
  {
    q: "How do views get counted?",
    steps: [
      {
        title: "Quick summary",
        content:
          "A view is recorded after the player passes a threshold (e.g., 5 seconds) and server validates it.",
      },
      {
        title: "Step 1 — Client triggers",
        content:
          "When the video plays past a configured threshold, the client sends a 'view' event to the server.",
      },
      {
        title: "Step 2 — Server validation",
        content:
          "Server validates the event (rate-limits, deduplication by user/IP) and increments the video view counter.",
      },
      {
        title: "Step 3 — UI update",
        content:
          "Frontend updates the displayed view count either by polling or receiving real-time update.",
      },
      {
        title: "Notes",
        content:
          "Tiny or quick visits are often ignored to prevent spammy counts.",
      },
    ],
  },
  {
    q: "How do likes and dislikes work?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Click Like/Dislike — frontend fires API to record reaction; UI updates optimistically.",
      },
      {
        title: "Step 1 — User action",
        content: "Click Like or Dislike on the video page.",
      },
      {
        title: "Step 2 — API call",
        content: "Frontend sends an action (videoId + action) to the server.",
      },
      {
        title: "Step 3 — Server updates",
        content:
          "Server creates/updates the user's reaction, adjusts aggregate counts, and returns the latest totals.",
      },
      {
        title: "Step 4 — Toggling behavior",
        content:
          "Clicking the same reaction again removes it. Switching from like to dislike updates the record accordingly.",
      },
    ],
  },
  {
    q: "How do comments and replies work?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Post comments under videos; replies can be nested (commonly one-level deep).",
      },
      {
        title: "Step 1 — Post comment",
        content:
          "Type in the comment box and submit to create a top-level comment.",
      },
      {
        title: "Step 2 — Reply",
        content:
          "Click Reply on a comment to show a nested input; submit to attach reply to that comment.",
      },
      {
        title: "Step 3 — Data model",
        content:
          "Each comment: id, authorId, videoId, parentId (null for top-level), text, timestamps.",
      },
      {
        title: "Step 4 — Moderation & UX",
        content:
          "Enable edit/delete for owner, rate-limiting, profanity filters, and lazy-loading/pagination for performance.",
      },
    ],
  },
  {
    q: "How can I delete my comment or reply?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Find your comment, click Delete, confirm, and the server removes or soft-deletes it.",
      },
      {
        title: "Step 1 — Locate",
        content: "Find the comment/reply you authored.",
      },
      {
        title: "Step 2 — Click Delete",
        content:
          "Use the delete icon/button next to the comment and confirm the prompt.",
      },
      {
        title: "Step 3 — Server processing",
        content:
          "Server checks ownership and either performs a soft-delete (preserve replies) or hard-delete depending on design.",
      },
    ],
  },
  {
    q: "What is Watch History and how is it stored?",
    steps: [
      {
        title: "Quick summary",
        content:
          "History stores videos you watched; recorded on server with timestamp and retrievable from History page.",
      },
      {
        title: "Step 1 — Client tracking",
        content:
          "After the view threshold is met the client sends a 'record history' event.",
      },
      {
        title: "Step 2 — Server persistence",
        content:
          "Server stores userId, videoId, timestamp in a history collection/table.",
      },
      {
        title: "Step 3 — Retrieval & privacy",
        content:
          "History page lists entries sorted by timestamp. Provide 'Clear history' to remove user-specific entries.",
      },
    ],
  },
  {
    q: "How do I subscribe to a channel?",
    steps: [
      {
        title: "Quick summary",
        content:
          'Tap "Subscribe" on the channel header or the channel card; the button toggles and the server updates.',
      },
      {
        title: "Step 1 — Open channel",
        content:
          "Click the channel name/avatar from a video page or open the channel card.",
      },
      {
        title: "Step 2 — Tap Subscribe",
        content:
          'Tap once. Button changes to "Subscribed" (optimistic UI). Tapping again toggles unsubscribe (may show confirmation).',
      },
      {
        title: "Step 3 — Backend (automatic)",
        content:
          "The app sends a subscribe/unsubscribe request to the server; the server toggles the record and updates counts.",
      },
      {
        title: "Step 4 — After subscribing",
        content:
          "Subscriber count increments and channel may appear in your subscriptions feed. Optionally enable upload notifications.",
      },
      {
        title: "Troubleshooting",
        content:
          "If the button doesn't change ensure you're signed in. If counts don't refresh, reload the page or retry toggling.",
      },
    ],
  },
  {
    q: "How do I customize my channel?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Use Customize Channel to update name, bio, avatar, banner and contact info.",
      },
      {
        title: "Step 1 — Open Customize Channel",
        content:
          'Navigate to "Customize Channel" from the sidebar or profile menu.',
      },
      {
        title: "Step 2 — Edit fields",
        content:
          "Change channel name, display name, bio/about, avatar image, and banner.",
      },
      {
        title: "Step 3 — Save",
        content:
          "Click Save — frontend sends a PATCH with changed fields to the server.",
      },
      {
        title: "Step 4 — Server validation & preview",
        content:
          "Server validates inputs (e.g., unique channel name) and updates DB. Preview or view public channel to confirm changes.",
      },
    ],
  },
  {
    q: "How is username/channel handle availability checked?",
    steps: [
      {
        title: "Quick summary",
        content:
          "While typing a handle the frontend checks availability (debounced) and shows inline feedback.",
      },
      {
        title: "Step 1 — Live check",
        content:
          "Frontend sends a debounced request (300–500ms) as the user types.",
      },
      {
        title: "Step 2 — Server validation",
        content: "Server validates characters/length and checks DB uniqueness.",
      },
      {
        title: "Step 3 — Feedback",
        content:
          'Show "Available" or "Already taken" and optionally suggested alternatives.',
      },
    ],
  },
  {
    q: "How do I reset a forgotten password?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Use Forgot Password — enter email, receive a secure link/OTP, then set a new password.",
      },
      {
        title: "Step 1 — Open Forgot password",
        content: 'Click "Forgot password" on the login page.',
      },
      {
        title: "Step 2 — Enter email",
        content: "Submit the email associated with your account.",
      },
      {
        title: "Step 3 — Email with token",
        content:
          "Server sends an email with a time-limited reset link or OTP. Tokens should be single-use and expire (e.g., 1 hour).",
      },
      {
        title: "Step 4 — Reset",
        content:
          "Open the link, enter new password twice, submit, then log in with the new password.",
      },
    ],
  },
  {
    q: "Is email verification required and how does it work?",
    steps: [
      {
        title: "Quick summary",
        content:
          "After signup the server may send a verification link/OTP — complete it to verify your account.",
      },
      {
        title: "Step 1 — Trigger",
        content:
          "Server sends verification automatically after signup or when you request it.",
      },
      {
        title: "Step 2 — Delivery",
        content: "Email contains a verification link or OTP code.",
      },
      {
        title: "Step 3 — Complete",
        content:
          "Click the link or enter the OTP to mark account as verified on the server.",
      },
      {
        title: "Step 4 — Post-verification",
        content:
          "Show a verified badge on profile, enable verified-only features if any, and allow resend with cooldown to avoid spam.",
      },
    ],
  },
  {
    q: "How are files uploaded from the client to server?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Client uses multipart/form-data; server parses with middleware (e.g., Multer) and stores/forwards the files.",
      },
      {
        title: "Step 1 — Encoding",
        content:
          "Use multipart/form-data and file inputs (thumbnail + video fields).",
      },
      {
        title: "Step 2 — Upload UX",
        content:
          "Show an upload progress bar and optionally support drag-and-drop and resumable uploads.",
      },
      {
        title: "Step 3 — Server handling",
        content:
          "Server validates file type/size, stores on disk or uploads to cloud storage, and returns file URLs for metadata.",
      },
      {
        title: "Best practice",
        content:
          "For very large files use chunked/resumable uploads and provide user-friendly progress & retry logic.",
      },
    ],
  },
  {
    q: "How do I delete a video I uploaded?",
    steps: [
      {
        title: "Quick summary",
        content:
          "From All Videos or channel page, click delete on your video and confirm — server removes the record and assets.",
      },
      {
        title: "Step 1 — Find the video",
        content: "Open All Videos or your channel and locate the video card.",
      },
      {
        title: "Step 2 — Delete action",
        content:
          "Click the delete icon/button and confirm the prompt in the UI.",
      },
      {
        title: "Step 3 — Server checks",
        content:
          "Server verifies ownership and either soft-deletes (mark removed) or hard-deletes the DB record and removes assets from storage.",
      },
      {
        title: "Step 4 — Post-delete cleanup",
        content:
          "Decide whether to remove related comments/likes or mark them as orphaned. Consider a recovery grace period if soft-delete.",
      },
    ],
  },
  {
    q: "How does streaming and progressive playback work for large files?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Server supports HTTP Range requests; the video element requests ranges for seeking and buffering.",
      },
      {
        title: "Step 1 — Range support",
        content:
          "Implement server-side support for the Range header so the browser can request byte-ranges for partial downloads.",
      },
      {
        title: "Step 2 — <video> setup",
        content:
          "<video> element handles range requests automatically and allows users to seek smoothly.",
      },
      {
        title: "Step 3 — Performance tips",
        content:
          "Serve videos through a CDN for scale, or use cloud storage signed URLs for protection.",
      },
    ],
  },
  {
    q: "Are there rate limits (e.g., for OTPs or comments)?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Define and enforce per-endpoint limits, use Redis or DB counters with TTL, and return clear cooldown messages.",
      },
      {
        title: "Step 1 — Define limits",
        content:
          "Example: OTPs max 3/hour per email; comments max 5/min per user. Tune thresholds based on traffic and abuse patterns.",
      },
      {
        title: "Step 2 — Enforce",
        content:
          "Use Redis or in-memory counters with TTL to track attempts and deny when over the limit.",
      },
      {
        title: "Step 3 — UX",
        content:
          "Return helpful messages like 'Try again in X minutes' and display cooldown timers on the UI so users understand the restriction.",
      },
    ],
  },
  {
    q: "Who do I contact for bugs or feature requests?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Use Send Feedback in-app or the project's issue tracker; include reproduction steps and screenshots.",
      },
      {
        title: "Step 1 — Send feedback",
        content:
          'Click "Send Feedback" in the sidebar or use the contact/support link in the app.',
      },
      {
        title: "Step 2 — Provide details",
        content:
          "Include steps to reproduce, expected vs actual behavior, browser/device info, and screenshots if possible.",
      },
      {
        title: "Step 3 — Follow up",
        content:
          "Optionally supply an email for follow-up; support may respond with a ticket ID or additional instructions.",
      },
    ],
  },
  {
    q: "How can I clear my account data or delete my account?",
    steps: [
      {
        title: "Quick summary",
        content:
          "Use Account settings to export or delete data; confirm identity and follow on-screen steps.",
      },
      {
        title: "Step 1 — Open Account settings",
        content: "Navigate to Account or Profile in the UI.",
      },
      {
        title: "Step 2 — Export or delete",
        content:
          "If available choose Export data to download your info. Click Delete account to start deletion flow.",
      },
      {
        title: "Step 3 — Confirm identity",
        content:
          "Enter password or pass 2FA to confirm the destructive action.",
      },
      {
        title: "Step 4 — Deletion behavior",
        content:
          "Server may soft-delete (allow recovery for a grace period) or hard-delete immediately. Make sure to warn users about irreversible removal.",
      },
    ],
  },
  {
    q: "Why are videos showing twice (2× duplicates) on the Home page?",
    steps: [
      {
        title: "Quick summary (read this first)",
        content:
          "In React 18 (development mode), useEffect runs twice due to StrictMode. If the Home page fetch logic appends videos to state, the same videos get added twice unless guarded.",
      },

      {
        title: " Understand the root cause",
        content:
          "React 18 StrictMode intentionally mounts components twice in development.\n\nSequence:\n1) Component mounts → useEffect runs\n2) Cleanup runs\n3) Component mounts again → useEffect runs again\n\nThis is DEV-only but exposes unsafe side-effects.",
      },

      {
        title: "Identify the risky pattern",
        content:
          "The issue happens when:\n• useEffect() calls a fetch function\n• fetched data is appended using setState(prev => [...prev, item])\n• timers / async logic are involved\n\nResult: same items are appended twice.",
      },

      {
        title: " Minimal & correct fix (core step)",
        content:
          "Guard the fetch logic using useRef so it runs only once per mount.\n\nCore idea:\n• useRef persists across renders\n• useRef does NOT trigger re-render\n• useRef can block duplicate side-effects",
      },

      {
        title: " Solution : Execute Step 5, 6, 7",
        content: `Maximum 3 steps required 
        
        Part 1: add ref at top of \`Home.jsx\` " 
        Add this guard at the top:
        \`\`\`js
    const hasFetchedRef = useRef(false);
        \`\`\`This prevents duplicate execution in React 18 StrictMode.`,
      },

      {
        title: "guard fetchVideos",
        content: `Part 2 : 
       Modify \`fetchVideos\` like this:
       \`\`\`js
     const fetchVideos = useCallback(async () => {

     if (hasFetchedRef.current) return;          // 🔐 block second run
     hasFetchedRef.current = true;               //  add this

     let mounted = true;
     setFetching(true);
     setError(null);
     setDisplayed([]);
     . . .
        \`\`\`
        `,
      },

      {
        title: "reset ref on cleanup",
        content: ` Part 3: 
          Modify your \`useEffect\` cleanup:
          \`\`\`js
     useEffect(() => {
     fetchVideos()       ;       
     return () => {
       hasFetchedRef.current = false;       // 🔄 allow future reloads
       timersRef.current.forEach(clearTimeout);
       timersRef.current = [];
     };
    , [fetchVideos]);

          \`\`\`
          `,
      },

      {
        title: "Common mistakes to avoid",
        content:
          "❌ Disabling StrictMode\n❌ Deduplicating arrays after the fact\n❌ Fixing this in backend\n❌ Ignoring timers in cleanup\n\nThese hide the bug instead of fixing it.",
      },

      {
        title: "Add-on help (advanced but optional)",
        content:
          "For advanced setups:\n• Convert timers to requestAnimationFrame\n• Abort fetch using AbortController\n• Move fetch logic into a custom hook (useHomeVideos)\n• Log StrictMode behavior explicitly in DEV\n\nOnly do this if complexity grows.",
      },
    ],
  },
];

function renderHelpContent(text) {
  if (!text) return null;

  // Split by fenced code blocks ```
  const parts = text.split(/```/g);

  return parts.map((part, index) => {
    // ODD index → code block
    if (index % 2 === 1) {
      return (
        <pre
          key={index}
          className="my-3 rounded-2xl bg-gray-900 text-white p-4 text-xs sm:text-sm overflow-x-auto"
        >
          <code>{part.trim()}</code>
        </pre>
      );
    }

    // EVEN index → normal text (with inline highlights)
    return (
      <p
        key={index}
        className="text-gray-700 dark:text-gray-300 text-sm sm:text-base whitespace-pre-line"
      >
        {part.split(/(`[^`]+`)/g).map((chunk, i) => {
          // inline `fileOrFunction`
          if (chunk.startsWith("`") && chunk.endsWith("`")) {
            return (
              <span
                key={i}
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-mono text-xs sm:text-sm "
              >
                {chunk.slice(1, -1)}
              </span>
            );
          }
          return chunk;
        })}
      </p>
    );
  });
}

function StepItem({ step, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-4 border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden ">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="w-full flex  items-start justify-between gap-4 px-4 py-3 sm:px-5 sm:py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
      >
        <div className="flex-1 text-left">
          <div className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
            <span className="inline-block mr-2 text-blue-600">
              Step {index + 1}
            </span>
            {step.title}
          </div>
          {step.content ? (
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {/* preview line */}
              {step.content.split("\n")[0]}
              {step.content.includes("\n") ? " ..." : ""}
            </div>
          ) : null}
        </div>

        <div className="flex-shrink-0 ml-5">
          <svg
            className={`w-5 h-5 transform transition-transform duration-400 ${
              open ? "rotate-45" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M10 4v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 10h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <div
        className={`px-4 pb-4 transition-[max-height,opacity] duration-400 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ willChange: "max-height, opacity" }}
        aria-hidden={!open}
      >
        <div className="pt-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base whitespace-pre-line">
          {renderHelpContent(step.content)}
        </div>
      </div>
    </div>
  );
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);
  // 🔹 NEW: refs for each FAQ card
  const faqRefs = useRef([]);

  // 🔹 NEW: auto-scroll when FAQ opens
  useEffect(() => {
    if (openIndex !== null && faqRefs.current[openIndex]) {
      faqRefs.current[openIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [openIndex]);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-8 lg:py-12 mt-10 mx-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Help
          </h1>
        </header>

        <main className="grid grid-cols-1 gap-6 lg:gap-10 lg:grid-cols-12 ">
          {/* Left: FAQ list (full-width on mobile, 7 cols on desktop) */}
          <section className="lg:col-span-8 space-y-4 ">
            {faqs.map((faq, i) => {
              const open = openIndex === i;
              return (
                <article
                  key={i}
                  className="bg-white dark:bg-[#0f0f0f] border-4 border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden  "
                >
                  <button
                    onClick={() =>
                      setOpenIndex((prev) => (prev === i ? null : i))
                    }
                    aria-expanded={open}
                    className="w-full text-left px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex-1 ">
                      <div className="flex items-center justify-between gap-4 ">
                        <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200">
                          {faq.q}
                        </h2>
                        {/* optional small meta on desktop */}
                      </div>
                      <p className="mt-1 text-sm sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {faq.steps?.[0]?.content?.split("\n")[0] ?? ""}
                        {faq.steps?.[0]?.content?.includes("\n") ? " ..." : ""}
                      </p>
                    </div>

                    <div className="flex-shrink-0 ">
                      <svg
                        className={`w-5 h-5 transform transition-transform duration-200 ${
                          open ? "rotate-45" : "rotate-0"
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M10 4v12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 10h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`px-4 pb-4 transition-[opacity] duration-300 ${
                      open ? "opacity-100" : "opacity-0 hidden"
                    }`}
                    aria-hidden={!open}
                  >
                    <div className="pt-2 space-y-3  ">
                      {faq.steps?.map((step, idx) => (
                        <StepItem key={idx} step={step} index={idx} />
                      ))}
                    </div>

             
                  </div>
                </article>
              );
            })}
          </section>

          {/* Right: Helper column (visible on tablet/desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white dark:bg-[#0f0f0f] border-4 border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Quick actions
                </h3>
                <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Search the FAQ (coming soon)</li>
                  <li>Open feedback form from the sidebar</li>
                  <li>Visit your Account settings to manage profile</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-[#0f0f0f] border-4 border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm   ">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Tips for mobile
                </h3>
                <ul className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Tap a question to expand steps.</li>
                  <li>Tap a step to read full details and substeps.</li>
                  <li>
                    Use landscape mode for wider video thumbnails and examples.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </main>

        {/* Footer note: mobile-friendly */}
        <footer className="mt-8 sm:mt-10 mb-6 text-sm text-gray-500 max-w-3xl"></footer>
      </div>
    </div>
  );
}
