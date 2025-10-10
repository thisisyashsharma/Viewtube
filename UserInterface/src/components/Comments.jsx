//EU9u1.p7.a1.471ln - Comment + Username
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";

export default function Comments({ videoId }) {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [me, setMe] = useState(null); // current user for owner-only delete

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

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">{commentCount} Comments</h3>
      <div className="flex item-center mb-2 ">
        <input
          className="pl-3 px-1 p-2 flex-1 border-b-2 border-gray-300 text-gray-400 focus:text-gray-900 rounded-tl-xl focus:border-gray-900 focus:bg-gray-100 outline-none transition-all duration-500"
          placeholder={`Add a comment...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="border-b-2 px-4 border-blue-700 px-3 py-2 font-medium rounded-tr-xl bg-blue-600 text-white hover:bg-blue-900 transition duration-500"
          onClick={post}
        >
          Comment
        </button>
      </div>

      <ul>
        {items.map((c) => {
          const replyById = Object.fromEntries(
            (c.replies || []).map((r) => [r._id, r])
          );
          const flatReplies = [...(c.replies || [])].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          return (
            <li key={c._id} className="m-0 p-0">
              {/* comment header — AVATAR + @username (no real name) + date */}
              <div className="flex items-center gap-2 ">
                <img
                  src={c.owner?.avatar}
                  className="w-10 h-10 rounded-full  transform translate-y-2.5"
                />
                <div className="text-[0.85rem] text-gray-700 font-semibold">
                  @{c.owner?.username}
                </div>
                <div className="text-[0.75rem] text-gray-500">
                  {fmt(c.createdAt)}
                </div>
              </div>

              {/* comment content */}
              <div className="ml-12 mt-1 text-[0.90rem]  m-0 p-0">
                {renderWithMentions(c.content)}
              </div>

              {/* actions */}
              {/* actions row (Like • Reply • Delete) */}
              <div className="ml-10 mt-2 flex items-center gap-1 text-xs">
                {/* Like (styled like Video.jsx) */}
                <button
                  onClick={() => likeComment(c._id)}
                  className={[
                    "inline-flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 transition duration-200",
                    likedByMeComment(c) ? "text-blue-500 " : "text-gray-400 ",
                  ].join(" ")}
                  aria-pressed={likedByMeComment(c)}
                  aria-label={
                    likedByMeComment(c) ? "Unlike comment" : "Like comment"
                  }
                  title={likedByMeComment(c) ? "Unlike" : "Like"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={likedByMeComment(c) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                    />
                  </svg>
                  <span className="px-1.5 py-0.5 text-[15px] font-semibold">
                    {commentLikesCount(c)}
                  </span>
                </button>

                {/* Reply */}
                <button
                  className="inline-flex items-center text-[0.80rem] gap-1 px-2.5 py-1.5 font-semibold rounded-lg text-blue-600 text-base hover:bg-gray-100 focus:bg-gray-200 transition duration-200"
                  onClick={() => openReplyForComment(c._id)}
                  aria-label="Reply to comment"
                  title="Reply"
                >
                  Reply
                </button>

                {/* owner-only Delete */}
                {me && c.owner?._id === me._id && (
                  <button
                    className="inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600 focus:outline-none rounded-[0.6rem] px-3 py-2 transition duration-400"
                    onClick={() => deleteComment(c._id)}
                    aria-label="Delete comment"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* inline box for replying to the comment */}
              {openReplyBox[c._id]?.openOn === "comment" && (
                <div className="ml-10 mt-2">
                  <ReplyInline
                    autoFocus
                    initialText={openReplyBox[c._id].initialText}
                    placeholder={`Reply to @${c.owner?.username}...`}
                    onSubmit={(t) => addReply(c._id, t, null)}
                  />
                </div>
              )}

              {/* FLAT replies */}
              <div className="ml-14 mt-3 space-y-3">
                {flatReplies.map((r) => {
                  const target = r.parentReply
                    ? replyById[r.parentReply]
                    : null;
                  const targetUsername = target?.owner?.username;

                  return (
                    <div key={r._id}>
                      {/* reply header — avatar + @username + date */}
                      <div className="flex items-center gap-2">
                        <img
                          src={r.owner?.avatar}
                          className="w-8 h-8 rounded-full translate-y-2.5"
                        />
                        <div className="text-sm text-gray-700">
                          @{r.owner?.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fmt(r.createdAt)}
                        </div>
                      </div>

                      {/* reply content (flat), with optional ↪ @target */}
                      <div className="ml-10 text-sm">
                        {targetUsername && (
                          <span className="mr-1 opacity-70">
                            ↪ @{targetUsername}
                          </span>
                        )}
                        {renderWithMentions(r.content)}
                      </div>

                      {/* reply actions */}
                      {/* actions row (Like • Reply • Delete) */}
                      <div className="ml-8 mt-2 flex items-center gap-0 text-xs">
                        {/* Like (styled like Video.jsx) */}
                        <button
                          onClick={() => likeReply(c._id, r._id)}
                          className={[
                            "inline-flex items-center gap-0 px-2 py-2 rounded-lg hover:bg-gray-100 transition duration-200",
                            likedByMe(r) ? "text-blue-500" : "text-gray-400",
                          ].join(" ")}
                          aria-pressed={likedByMe(r)}
                          aria-label={
                            likedByMe(r) ? "Unlike reply" : "Like reply"
                          }
                          title={likedByMe(r) ? "Unlike" : "Like"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill={likedByMe(r) ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                          </svg>
                          <span className="px-1.5 py-0.5 text-[15px] font-semibold">
                            {replyLikesCount(r)}
                          </span>
                        </button>

                        {/* Reply */}
                        <button
                          className="inline-flex items-center text-[0.80rem] gap-1 px-2.5 py-1.5 font-semibold rounded-lg text-blue-600 text-base hover:bg-gray-100 focus:bg-gray-200 transition duration-200"
                          onClick={() => openReplyForReply(c._id, r)}
                          aria-label={`Reply to @${r.owner?.username}`}
                          title={`Reply to @${r.owner?.username}`}
                        >
                          Reply
                        </button>

                        {/* owner-only Delete */}
                        {me && r.owner?._id === me._id && (
                          <button
                            // className="inline-flex items-center justify-center text-red-400 focus:bg-red-400 focus:text-white hover:bg-gray-100 focus:outline-none rounded-lg px-3 py-2 transition duration-500"
                            className="inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-red-600 focus:outline-none rounded-[0.6rem] px-3 py-2 transition duration-400"
                            onClick={() => deleteReply(c._id, r._id)}
                            aria-label="Delete reply"
                            title="Delete reply"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* inline box for replying to this reply (prefilled @username), still flat */}
                      {openReplyBox[c._id]?.openOn === "reply" &&
                        openReplyBox[c._id]?.reply?._id === r._id && (
                          <div className="ml-8 mt-2">
                            <ReplyInline
                              autoFocus
                              initialText={openReplyBox[c._id].initialText}
                              placeholder={`Reply to @${r.owner?.username}…`}
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
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      {/* sticky bottom: Load More */}
      {hasMore && (
        <div className="sticky bottom-0 bg-white py-3">
          <button
            disabled={loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              await load(page + 1);
              setLoadingMore(false);
            }}
            className="w-full border rounded py-2"
          >
            {loadingMore ? "Loading…" : "Load more comments"}
          </button>
        </div>
      )}
    </div>
  );
}

function ReplyInline({
  onSubmit,
  initialText = "",
  placeholder = "Reply…",
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
    <div className="flex items-center  ">
      <input
        className="pl-3 px-1 text-sm p-2 border-gray-300 border-b-2 flex-1 text-gray-400 focus:text-gray-900 rounded-tl-xl focus:border-gray-900 focus:bg-gray-100 outline-none transition-all duration-500"
        placeholder={placeholder}
        value={t}
        onChange={(e) => setT(e.target.value)}
        autoFocus={autoFocus}
      />

      <button
        className="text-sm border-b-2 border-blue-700 px-3 py-2 font-medium rounded-tr-lg bg-blue-500 text-white hover:bg-blue-800 transition duration-500"
        onClick={handleSubmit}
      >
        Reply
      </button>
    </div>
  );
}
