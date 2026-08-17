 
import { useSelector } from "react-redux";

export default function About() {
  // This reads the current channel / logged-in user from redux (adjust if you use different store key)
  const channel = useSelector((s) => s.auth?.user) || {};

  const joined = channel?.createdAt
    ? new Date(channel.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">{channel?.name || "Channel"}</h2>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {joined ? <div>Joined {joined}</div> : null}
        <div>{(channel?.subscribers || 0) + " subscribers"}</div>
      </div>

      <section className="bg-gray-50 dark:bg-[#0f0f0f] border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        <h3 className="font-medium mb-2 text-black dark:text-white">About</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {channel?.about || "No description provided."}
        </p>
      </section>
    </div>
  );
}
