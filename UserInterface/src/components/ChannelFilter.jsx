// ChannelFilter.jsx - New component
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton.jsx";

function ChannelFilter({ searchQuery = "" }) {
    const [channels, setChannels] = useState([]);
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const res = await axios.get("/api/v1/account/subscriptions");
            setChannels(res.data.data.channels || []);
            setFilteredChannels(res.data.data.channels || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Filter channels when searchQuery changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredChannels(channels);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = channels.filter(ch =>
            ch.username?.toLowerCase().includes(query) ||
            ch.name?.toLowerCase().includes(query)
        );
        setFilteredChannels(filtered);
    }, [searchQuery, channels]);

    if (loading) return <div className="p-6">Loading…</div>;

    return (
        <div className="w-full bg-white px-3 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Filtered Channels</h1>
                </div>
                <ul className="space-y-4">
                    {filteredChannels.map((ch) => (
                        <li
                            key={ch._id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full rounded-2xl sm:rounded-full border border-gray-200 bg-gray-50/50 p-4 hover:bg-gray-100 transition-colors"
                        >
                            <Link
                                to={`/channel/${ch._id}`}
                                className="flex items-center gap-4 flex-1 min-w-0"
                            >
                                <img
                                    src={ch.avatar}
                                    alt={ch.name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-base text-gray-900 truncate">{ch.name}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                                        @{ch.username ?? "-"} <span>{" • "}</span>
                                        {ch.subscribersCount?.toLocaleString() ?? "0"} subscribers
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {ch.about || "-"}
                                    </div>
                                </div>
                            </Link>
                            <div className="flex-shrink-0 font-semibold self-end sm:self-center">
                                <SubscribeButton
                                    channelId={ch._id}
                                    defaultSubscribed={true}
                                />
                            </div>
                        </li>
                    ))}
                    {filteredChannels.length === 0 && (
                        <li className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-xl">
                            {searchQuery
                                ? `No channels found for "${searchQuery}"`
                                : "You haven't subscribed to any channels yet."}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default ChannelFilter;