// /mnt/data/KeyboardShortcuts.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * KeyboardShortcuts.jsx (Light mode, responsive)
 * - Multiple groups can be open at once.
 * - First two groups are open by default when the page loads.
 * - User can close/open any group; state is kept in-memory.
 * - DOES NOT register global key handlers (safe for browsers/OS).
 *
 * Save/replace at: /mnt/data/KeyboardShortcuts.jsx
 */

const SHORTCUT_GROUPS = [
  {
    id: "browser-navigation",
    title: "Navigations",
    description: "Navigate tabs, pages, and window behavior — standard across most browsers.",
    shortcuts: [
      { keys: ["Alt", "←"], desc: "Go back" },
      { keys: ["Alt", "→"], desc: "Go forward" },
      { keys: ["Ctrl", "R"], desc: "Reload page" },
      { keys: ["Ctrl", "Shift", "R"], desc: "Hard reload / bypass cache" },
      { keys: ["Esc"], desc: "Stop loading page (or close some modals)" }
    ]
  },
  
  {
    id: "page-interaction",
    title: "Page interaction & find",
    description: "Find text, focus address bar, move around the page.",
    shortcuts: [
      { keys: ["/"], desc: "Focus page search (if not used by site)" },
      { keys: ["Ctrl", "F"], desc: "Find in page" },
      { keys: ["Ctrl", "L"], desc: "Focus address bar" },
      { keys: ["Space"], desc: "Scroll down (page) — when not focused on input" },
      { keys: ["Shift", "Space"], desc: "Scroll up (page)" },
      { keys: ["Home"], desc: "Go to top of page" },
      { keys: ["End"], desc: "Go to bottom of page" }
    ]
  },
  {
    id: "zoom-appearance",
    title: "Zoom & Appearance",
    description: "Adjust page zoom or view source/console.",
    shortcuts: [
      { keys: ["Ctrl", "+"], desc: "Zoom in" },
      { keys: ["Ctrl", "-"], desc: "Zoom out" },
      { keys: ["Ctrl", "0"], desc: "Reset zoom" },
      { keys: ["Ctrl", "Shift", "I"], desc: "Open DevTools (Windows/Linux)" },
      { keys: ["Ctrl", "Shift", "J"], desc: "Open Console (Windows/Linux)" }
    ]
  },
  {
    id: "text-editing",
    title: "Text editing & selection (system-wide)",
    description: "Standard text editing shortcuts used in inputs and editors.",
    shortcuts: [
      { keys: ["Ctrl", "A"], desc: "Select all" },
      { keys: ["Ctrl", "C"], desc: "Copy selected text" },
      { keys: ["Ctrl", "V"], desc: "Paste" },
      { keys: ["Ctrl", "X"], desc: "Cut" },
      { keys: ["Ctrl", "Z"], desc: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], desc: "Redo" }
    ]
  },
  {
    id: "media-playback",
    title: "Media playback (audio / video players)",
    description: "Common controls for media players in browser pages.",
    shortcuts: [
      { keys: ["Space"], desc: "Play / Pause (when player focused)" },
      { keys: ["M"], desc: "Mute / Unmute (player-focused sites)" },
      { keys: ["←"], desc: "Seek backward (small step)" },
      { keys: ["→"], desc: "Seek forward (small step)" },
      { keys: ["F"], desc: "Toggle fullscreen (player)" },
      { keys: ["Ctrl", "Shift", "M"], desc: "Toggle mute in browser (may vary)" }
    ]
  },
  {
    id: "accessibility",
    title: "Accessibility & system",
    description: "System-level or accessibility-related shortcuts (Windows-focused).",
    shortcuts: [
      { keys: ["Win", "L"], desc: "Lock your PC (Windows)" },
      { keys: ["Win", "D"], desc: "Show desktop / minimize all windows" },
      { keys: ["Alt", "Tab"], desc: "Switch between open apps" },
      { keys: ["Win", "Plus"], desc: "Open Magnifier (Windows)" }
    ]
  },
  {
    id: "productivity",
    title: "Productivity (browser windows & tabs)",
    description: "Useful tab/window shortcuts for power users.",
    shortcuts: [
      { keys: ["Ctrl", "Shift", "N"], desc: "Open Incognito / Private window" },
      { keys: ["Ctrl", "1..8"], desc: "Go to specific tab number (1 = leftmost)" },
      { keys: ["Ctrl", "9"], desc: "Last tab" },
      { keys: ["Ctrl", "D"], desc: "Bookmark current page" }
    ]
  },
  {
    id: "tabs-windows",
    title: "Tabs & Windows",
    description: "Open, close and move between tabs & windows.",
    shortcuts: [
      { keys: ["Ctrl", "T"], desc: "Open new tab" },
      { keys: ["Ctrl", "W"], desc: "Close current tab" },
      { keys: ["Ctrl", "Shift", "T"], desc: "Reopen last closed tab" },
      { keys: ["Ctrl", "Tab"], desc: "Next tab" },
      { keys: ["Ctrl", "Shift", "Tab"], desc: "Previous tab" },
      { keys: ["Ctrl", "N"], desc: "Open new window" },
      { keys: ["Alt", "F4"], desc: "Close window (Windows)" }
    ]
  },
];

function KeyPill({ keys }) {
  return (
    <div className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 px-2 py-1 rounded-lg shadow-sm text-xs sm:text-sm">
      {keys.map((k, i) => (
        <span
          key={i}
          className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-800 border-2 border-gray-200 whitespace-nowrap"
        >
          {k}
        </span>
      ))}
    </div>
  );
}

export default function KeyboardShortcuts() {
  const [query, setQuery] = useState("");

  // Open the first two groups by default on first render.
  const initialOpen = useMemo(() => {
    const ids = [];
    if (SHORTCUT_GROUPS[0]) ids.push(SHORTCUT_GROUPS[0].id);
    if (SHORTCUT_GROUPS[1]) ids.push(SHORTCUT_GROUPS[1].id);
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openGroups, setOpenGroups] = useState(initialOpen);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // filter groups and shortcuts by query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHORTCUT_GROUPS;
    return SHORTCUT_GROUPS.map((g) => {
      const matchedShortcuts = g.shortcuts.filter(
        (s) =>
          s.desc.toLowerCase().includes(q) ||
          s.keys.join(" ").toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q)
      );
      return { ...g, shortcuts: matchedShortcuts };
    }).filter((g) => g.shortcuts.length > 0 || g.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-4xl font-semibold tracking-tight mb-4">
                Keyboard Shortcuts
              </h1>
              <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                Handy shortcuts for an accessible quick-reference.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <label htmlFor="ks-search" className="sr-only">Search shortcuts</label>
                <input
                  id="ks-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shortcuts (e.g., 'tab', 'zoom', 'find')"
                  className="w-full rounded-lg border-4 border-gray-100 bg-white text-sm px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div>
                <button
                  onClick={() => { setOpenGroups(initialOpen); setQuery(""); }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:flex sm:items-center sm:justify-between">
             

            <div className="mt-3 sm:mt-0 text-right text-xs text-gray-500">
              <span>Related: </span>
              <a
                href="/mnt/data/Help.jsx"
                className="text-blue-600 hover:underline"
                title="Open Help (local file path)"
              >
                Open Help (local)
              </a>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / middle: main groups */}
          <section className="lg:col-span-2 space-y-6">
            {filtered.length === 0 ? (
              <div className="rounded-lg bg-white border-2 border-gray-100 p-6 text-center shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">No shortcuts found</h3>
                <p className="mt-2 text-sm text-gray-500">Try different keywords like "tab", "zoom", "find", or clear the search.</p>
              </div>
            ) : (
              filtered.map((group) => {
                const isOpen = openGroups.includes(group.id);
                return (
                  <article
                    key={group.id}
                    className="rounded-3xl bg-white border-4 border-gray-100 p-5 pink  "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{group.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline focus:outline-none"
                          aria-expanded={isOpen}
                          aria-controls={`group-${group.id}`}
                        >
                          <span className="sr-only">{isOpen ? "Collapse" : "Expand"} {group.title}</span>
                          <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                            viewBox="0 0 20 20"
                            fill="none"
                            aria-hidden
                          >
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span aria-hidden className="">{isOpen ? "Collapse" : "Expand"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible content */}
                    <div
                      id={`group-${group.id}`}
                      className={`mt-4 overflow-hidden transition-[max-height,opacity] duration-300 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                      aria-hidden={!isOpen}
                      style={{ willChange: "max-height, opacity" }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.shortcuts.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-3 bg-gray-50 border-4 border-gray-100 rounded-xl"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800">{s.desc}</div>
                              <div className="text-xs text-gray-500 mt-1" />
                            </div>

                            <div className="flex items-center gap-2">
                              <KeyPill keys={s.keys} />
                              <button
                                onClick={() => {
                                  const text = `${s.keys.join(" + ")} — ${s.desc}`;
                                  navigator.clipboard?.writeText(text).catch(() => {});
                                }}
                                className="ml-2 px-2 py-1 rounded-md text-xs bg-white border-2 border-gray-100 hover:bg-gray-100 focus:outline-none"
                                title="Copy shortcut"
                                aria-label={`Copy ${s.keys.join(" plus ")} for ${s.desc}`}
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          {/* Right: quick reference & legend */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white border-4 border-gray-100 p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800">Legend</h4>
              <dl className="mt-3 text-sm text-gray-600 space-y-2">
                <div>
                  <dt className="font-medium text-gray-700">Key chips</dt>
                  <dd className="text-sm text-gray-500 mt-1">Each pill shows the exact keys to press in order — e.g., <span className="font-medium">Ctrl + T</span>.</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Copy</dt>
                  <dd className="text-sm text-gray-500 mt-1">Quickly copy a shortcut description to clipboard for your docs.</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-white border-2 border-gray-100 p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800">Safety & notes</h4>
              <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>This page intentionally avoids registering global key listeners to prevent interference.</li>
                <li>For app-specific shortcuts, implement <code>keydown</code> handlers scoped to your app and provide a toggle for users.</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border-2 border-gray-100 p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800">Coming soon</h4>
              <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Per-user shortcut customization</li>
                <li>Export printable cheat sheet (PDF)</li>
              </ul>
            </div>
          </aside>
        </main>

        <footer className="mt-10 text-sm text-gray-500">
          Built for quick reference — if you want, I can:
          <ul className="list-disc list-inside mt-2">
            <li>Convert the list to a printable PDF</li>
            <li>Add an interactive "?" modal that shows this panel (and optionally binds the key)</li>
            <li>Wire app-level shortcuts (safely, with user opt-in)</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
