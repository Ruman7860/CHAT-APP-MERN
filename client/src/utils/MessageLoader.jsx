import React from 'react';

const MessageLoader = () => {
    return (
        <div className="flex items-center justify-center py-4">
            <div className="relative">
                {/* Glowing background pulse */}
                <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-50 animate-ping"></div>

                {/* Spinning ring */}
                <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-600 animate-spin"></div>

                {/* Center dot pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full animate-pulse"></div>
                </div>
            </div>

            <span className="ml-3 text-sm font-medium text-blue-200 animate-pulse">
                Sending...
            </span>
        </div>
    );
};

export default MessageLoader;