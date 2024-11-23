import React from 'react';

const Tooltip = ({children,content}) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out bg-gray-800 text-white text-sm py-1 px-3 shadow-lg rounded-xl whitespace-nowrap">
                {content}
            </div>
        </div>
    )
}

export default Tooltip;