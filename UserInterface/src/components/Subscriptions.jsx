//EU6u4.p3.a1.69ln -  Subscribed Channels: build this subscribed page
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.api";

 function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/account/subscriptions");
      setChannels(res.data.data.channels || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onToggle = async (channelId) => {
    try {
      const res = await api.put(`/account/subscribe/${channelId}`);
      const { subscribed } = res.data.data;
      // If user unsubscribed, remove from list
      if (!subscribed) {
        setChannels(prev => prev.filter(c => c._id !== channelId));
      } else {
        // (rare path) if it was unsubbed somehow, add back by reloading
        load();
      }
    } catch (e) {
      console.error("Toggle subscribe failed", e);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Subscriptions</h1>
      <ul className="space-y-3">
        {channels.map(ch => (
          <li key={ch._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <Link to={`/channel/${ch._id}`} className="flex items-center gap-3">
              <img src={ch.avatar} alt={ch.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="font-medium">{ch.name}</div>
                <div className="text-xs text-gray-500">{ch.subscribersCount.toLocaleString()} subscribers</div>
              </div>
            </Link>

            <button
              onClick={() => onToggle(ch._id)}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md overflow-hidden border border-gray-200"
              aria-pressed
              title="Unsubscribe"
            >
              <span className="absolute top-0 bottom-0 left-0 z-0 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              <span className="relative z-10 text-white text-sm font-medium">Subscribed</span>
            </button>
          </li>
        ))}
        {channels.length === 0 && (
          <li className="text-sm text-gray-500">You haven’t subscribed to any channels yet.</li>
        )}
      </ul>
    </div>
  );
}

export default Subscriptions;