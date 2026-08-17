import React, { useState } from "react";
import ChannelFilter from "../components/ChannelFilter"; // Adjust path based on your structure

function ChannelSearchPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="p-6">
            {/* Search input at top */}
            <div className="max-w-4xl mx-auto mb-6">
                <input
                    type="text"
                    placeholder="Filter subscribed channels by username or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Search through your subscribed channels
                </p>
            </div>

            {/* The filtered channels component */}
            <ChannelFilter searchQuery={searchQuery} />
        </div>
    );
}

export default ChannelSearchPage;