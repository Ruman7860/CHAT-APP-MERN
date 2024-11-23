import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import { FaFile, FaImage } from 'react-icons/fa';

const AttachmentOptions = ({files,handleFileSelect,handleFileChange,photos,handlePhotoSelect,handlePhotoChange}) => {
  const {isDarkMode} = useTheme();
  return (
    <div className={`absolute bottom-12 left-4 w-32  p-2 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-950' : 'bg-white'} `}>
        <div 
            className="p-2 cursor-pointer flex items-center hover:bg-gray-300" 
            onClick={handleFileSelect}
        >
        <input hidden type="file" ref={files} onChange={handleFileChange} />
        <FaFile className="mr-2 text-blue-500" />
        <span>File</span>
        </div>
        <div 
        className="p-2 cursor-pointer flex items-center hover:bg-gray-300" onClick={handlePhotoSelect}
        >
        <input hidden type="file" ref={photos} onChange={handlePhotoChange}/>
        <FaImage className="mr-2 text-green-500" />
        <span>Photos</span>
        </div>
    </div>
  )
}

export default AttachmentOptions