import React from "react";
import PageContainer from "./layout/PageContainer";

function Shorts() {
  const sampleShorts = [
    { id: 1, title: "Cool AI Coding Trick 🚀", creator: "@kallu", likes: "12K", comments: "340" },
    { id: 2, title: "Build YouTube Clone in 10 mins", creator: "@viewtube", likes: "45K", comments: "1.2K" },
    { id: 3, title: "Tailwind CSS Secrets You Didn't Know", creator: "@devcraft", likes: "8.9K", comments: "180" },
    { id: 4, title: "React 19 New Features Breakdown", creator: "@frontend_master", likes: "28K", comments: "950" },
  ];

  return (
    <PageContainer>
      <div className="max-w-md mx-auto py-2 sm:py-4 px-2 sm:px-0">
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-black flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-black text-2xl">⚡</span>
            <span>Shorts Feed</span>
          </h1>
        </div>

        {/* Scrollable vertical feed */}
        <div className="space-y-6 sm:space-y-8 flex flex-col items-center">
          {sampleShorts.map((item) => (
            <div
              key={item.id}
              className="relative w-full max-w-[360px] sm:max-w-[380px] aspect-[9/16] bg-gray-200 rounded-[2rem] overflow-hidden  flex flex-col justify-between p-4 text-black border-[10px] border-gray-200"
            >
              {/* Top gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-gray-100/10 pointer-events-none" />

              {/* Sound indicator & Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 text-[11px] font-bold border-[5px]  text-black rounded-full tracking-wide ">
                  SHORTS
                </span>
                <div className="p-2 bg-white backdrop-blur-md rounded-full">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Details & Vertical Action Controls Bar */}
              <div className="relative z-10 flex items-end justify-between gap-3">
                {/* Creator info & title */}
                <div className="space-y-2 flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs border-[5px] border-gray-300">
                      {item.creator[1].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-black truncate">{item.creator}</span>
                  </div>
                  <h3 className="text-sm font-medium text-black line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Vertical action icons bar */}
                <div className="flex flex-col items-center space-y-4 flex-shrink-0">
                  <button className="flex flex-col items-center group">
                    <div className="p-2.5 bg-white backdrop-blur-md rounded-full group-hover:bg-blue-200/80 transition-colors">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
                      </svg>
                    </div>
                    <span className="text-[11px] mt-1 font-semibold text-black/90">{item.likes}</span>
                  </button>

                  <button className="flex flex-col items-center group">
                    <div className="p-2.5 bg-white backdrop-blur-md rounded-full group-hover:bg-blue-200/80 transition-colors">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-[11px] mt-1 font-semibold text-black/90">{item.comments}</span>
                  </button>

                  <button className="flex flex-col items-center group">
                    <div className="p-2.5 bg-white backdrop-blur-md rounded-full group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <span className="text-[11px] mt-1 font-semibold text-black/90">Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

export default Shorts;
