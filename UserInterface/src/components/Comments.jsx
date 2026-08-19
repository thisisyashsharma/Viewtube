import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { LineDrawIcon } from "./common";

export default function Comments({ videoId, onRequireAuth }) {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [me, setMe] = useState(null);
  useEffect(() => {
  axios.get("/api/v1/account/me", { withCredentials: true })
    .then(res => setMe(res.data.data))
    .catch(() => {});
}, []);
 

  // which reply box is open for a given comment
  const [openReplyBox, setOpenReplyBox] = useState({});
  const LIMIT = 20;


  const load = async (p = 1) => {
    const res = await axios.get(
      `/api/v1/comments/${videoId}?page=${p}&limit=${LIMIT}`,
      { withCredentials: true }
    );
    const { items: batch, hasMore: more } = res.data.data;
    setItems((prev) => (p === 1 ? batch : [...prev, ...batch]));
    setHasMore(more);
    setPage(p);
  };

  const loadMe = async () => {
    try {
      const res = await axios.get(`/api/v1/account/me`, {
        withCredentials: true,
      });
      setMe(res.data.data);
    } catch {}
  };

  // top-level comment
  const post = async () => {
    if (!me) return onRequireAuth?.();
    if (!text.trim()) return;
    await axios.post(
      `/api/v1/comments/${videoId}`,
      { content: text },
      { withCredentials: true }
    );
    setText("");
    await load(1);
  };

  const likeComment = async (id) => {
    if (!me) return onRequireAuth?.();
    await axios.patch(
      `/api/v1/comments/${id}/like`,
      {},
      { withCredentials: true }
    );
    await load(1);
  };

  const resolveParentReplyIdForOneLevel = (reply) =>
    !reply ? null : reply.parentReply ? reply.parentReply : reply._id;

  const addReply = async (commentId, content, parentReplyId = null) => {
    if (!me) return onRequireAuth?.();
    if (!content.trim()) return;
    const payload = parentReplyId ? { content, parentReplyId } : { content };
    await axios.post(`/api/v1/comments/${commentId}/replies`, payload, {
      withCredentials: true,
    });
    await load(1);
    setOpenReplyBox({});
  };

  // NEW: deletes
  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    await axios.delete(`/api/v1/comments/${commentId}`, {
      withCredentials: true,
    });
    await load(1);
  };

  const deleteReply = async (commentId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    await axios.delete(`/api/v1/comments/${commentId}/replies/${replyId}`, {
      withCredentials: true,
    });
    await load(1);
  };

  useEffect(() => {
    load(1);
    loadMe();
  }, [videoId]);

  const fmt = (iso) =>
    formatDistanceToNowStrict(new Date(iso), { addSuffix: true });

  const renderWithMentions = (s) =>
    (s || "").split(/(\@[a-zA-Z0-9_]+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-blue-600">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );

  const openReplyForComment = (commentId) => {
    setOpenReplyBox({ [commentId]: { initialText: "", openOn: "comment" } });
  };

  const openReplyForReply = (commentId, reply) => {
    const initialText = reply?.owner?.username
      ? `@${reply.owner.username} `
      : "";
    setOpenReplyBox({ [commentId]: { initialText, openOn: "reply", reply } });
  };

  // Does current user like this reply?
  const likedByMe = (reply) =>
    !!(
      me &&
      Array.isArray(reply?.likes?.users) &&
      reply.likes.users.some((u) => u === me._id)
    );

  // Safe count (use .count if present, else fall back to users length)
  const replyLikesCount = (reply) =>
    typeof reply?.likes?.count === "number"
      ? reply.likes.count
      : reply?.likes?.users?.length || 0;

  // Toggle like for a reply (uses your existing endpoint; no schema change)
  const likeReply = async (commentId, replyId) => {
    await axios.patch(
      `/api/v1/comments/${commentId}/replies/${replyId}/like`,
      {},
      { withCredentials: true }
    );
    await load(1); // refresh current list
  };

  // Is current user liking this comment?
  const likedByMeComment = (comment) =>
    !!(
      me &&
      Array.isArray(comment?.likes?.users) &&
      comment.likes.users.some((u) => u === me._id)
    );

  // Safe like count for a comment
  const commentLikesCount = (comment) =>
    typeof comment?.likes?.count === "number"
      ? comment.likes.count
      : comment?.likes?.users?.length || 0;

  // EU9u1.p8.a1.11ln - Comment + Username
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await axios.get(`/api/v1/comments/${id}/count`, {
          withCredentials: true,
        });
        setCommentCount(res.data.data.total || 0); // This will now return the combined count
      } catch (_) {
        console.error("Failed to fetch comment count");
      }
    };

    loadCount();
  }, [id]);

  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base text-gray-950 dark:text-white tracking-tight">
          {commentCount.toLocaleString()} {commentCount === 1 ? "Comment" : "Comments"}
        </h3>
      </div>

      {/* Main Comment Input Box */}
      <div className="flex items-start gap-3 pt-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-white/10">
          {me?.avatar ? (
            <img src={me.avatar} alt={me.name || "avatar"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
              {me?.name ? me.name[0].toUpperCase() : "U"}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="relative">
            <textarea
              rows={isInputFocused || text ? 2 : 1}
              className="w-full text-xs sm:text-sm p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100/80 dark:bg-[#181818] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              placeholder="Add a comment..."
              value={text}
              onFocus={() => {
                if (!me) onRequireAuth?.();
                setIsInputFocused(true);
              }}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {(isInputFocused || text) && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setIsInputFocused(false);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!text.trim()}
                onClick={async () => {
                  await post();
                  setIsInputFocused(false);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                  text.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <ul className="space-y-4 pt-2">
        {items.map((c) => {
          const replyById = Object.fromEntries(
            (c.replies || []).map((r) => [r._id, r])
          );
          const flatReplies = [...(c.replies || [])].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          return (
            <li key={c._id} className="space-y-2">
              {/* Comment Header + Content */}
              <div className="flex items-start gap-3">
                <img
                  src={c.owner?.avatar}
                  alt={c.owner?.username || "user"}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-white/10"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      @{c.owner?.username}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {fmt(c.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed break-words">
                    {renderWithMentions(c.content)}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 mt-1.5">
                    {/* Like */}
                    <button
                      type="button"
                      onClick={() => likeComment(c._id)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                        likedByMeComment(c)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      title={likedByMeComment(c) ? "Unlike" : "Like"}
                    >
                      <svg className="w-3.5 h-3.5" fill={likedByMeComment(c) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={likedByMeComment(c) ? 0 : 2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {commentLikesCount(c) > 0 && <span>{commentLikesCount(c)}</span>}
                    </button>

                    {/* Reply Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!me) return onRequireAuth?.();
                        openReplyForComment(c._id);
                      }}
                      className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Reply
                    </button>

                    {/* Owner Delete */}
                    {(me?.role === "admin" || c.owner?._id === me?._id) && (
                      <button
                        type="button"
                        onClick={() => deleteComment(c._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Delete comment"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Inline Reply Box for Comment */}
                  {openReplyBox[c._id]?.openOn === "comment" && (
                    <div className="mt-2.5">
                      <ReplyInline
                        autoFocus
                        initialText={openReplyBox[c._id].initialText}
                        placeholder={`Reply to @${c.owner?.username}...`}
                        onCancel={() => setOpenReplyBox({})}
                        onSubmit={(t) => addReply(c._id, t, null)}
                      />
                    </div>
                  )}

                  {/* Nested Flat Replies */}
                  {flatReplies.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-white/10 space-y-2.5">
                      {flatReplies.map((r) => {
                        const target = r.parentReply ? replyById[r.parentReply] : null;
                        const targetUsername = target?.owner?.username;

                        return (
                          <div key={r._id} className="flex items-start gap-2.5">
                            <img
                              src={r.owner?.avatar}
                              alt={r.owner?.username || "avatar"}
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-gray-200 dark:border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  @{r.owner?.username}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {fmt(r.createdAt)}
                                </span>
                              </div>

                              <div className="text-xs text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed break-words">
                                {targetUsername && (
                                  <span className="text-blue-600 dark:text-blue-400 font-semibold mr-1">
                                    @{targetUsername}
                                  </span>
                                )}
                                {renderWithMentions(r.content)}
                              </div>

                              <div className="flex items-center gap-3 mt-1">
                                <button
                                  type="button"
                                  onClick={() => likeReply(c._id, r._id)}
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                    likedByMe(r)
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill={likedByMe(r) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={likedByMe(r) ? 0 : 2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                  </svg>
                                  {replyLikesCount(r) > 0 && <span>{replyLikesCount(r)}</span>}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openReplyForReply(c._id, r)}
                                  className="text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                  Reply
                                </button>

                                {(me?.role === "admin" || r.owner?._id === me?._id) && (
                                  <button
                                    type="button"
                                    onClick={() => deleteReply(c._id, r._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                                    title="Delete reply"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {/* Nested reply box */}
                              {openReplyBox[c._id]?.openOn === "reply" &&
                                openReplyBox[c._id]?.reply?._id === r._id && (
                                  <div className="mt-2">
                                    <ReplyInline
                                      autoFocus
                                      initialText={openReplyBox[c._id].initialText}
                                      placeholder={`Reply to @${r.owner?.username}...`}
                                      onCancel={() => setOpenReplyBox({})}
                                      onSubmit={(t) =>
                                        addReply(
                                          c._id,
                                          t,
                                          resolveParentReplyIdForOneLevel(
                                            openReplyBox[c._id].reply
                                          )
                                        )
                                      }
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Sticky / Load More */}
      {hasMore && (
        <div className="pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              await load(page + 1);
              setLoadingMore(false);
            }}
            className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-[#181818] hover:bg-gray-200 dark:hover:bg-[#202020] text-xs font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 transition-colors cursor-pointer"
          >
            {loadingMore ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}

function ReplyInline({
  onSubmit,
  onCancel,
  initialText = "",
  placeholder = "Reply...",
  autoFocus = false,
}) {
  const [t, setT] = useState(initialText);

  useEffect(() => {
    setT(initialText);
  }, [initialText]);

  const handleSubmit = () => {
    const val = (t || "").trim();
    if (val.length <= initialText.trim().length) return;
    onSubmit(val);
    setT("");
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100/90 dark:bg-[#181818] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        placeholder={placeholder}
        value={t}
        onChange={(e) => setT(e.target.value)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!t.trim() || t.trim() === initialText.trim()}
          onClick={handleSubmit}
          className={`px-3.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
            t.trim() && t.trim() !== initialText.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          Reply
        </button>
      </div>
    </div>
  );
}
