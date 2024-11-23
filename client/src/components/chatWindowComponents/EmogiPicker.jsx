import EmojiPicker from 'emoji-picker-react'
import React from 'react'
import { FaSmile } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'

const EmogiPicker = ({setNewMessage}) => {
  const {isDarkMode} = useTheme();
  return (
    <div>
        <FaSmile 
        className="cursor-pointer text-gray-500 mr-2 text-lg" title="Add Emoji" 
        onClick={toggleEmojiPicker}
        />
        {/* Emoji Picker */}
        {showEmojiPicker && (
        <div className={`absolute bottom-12 left-12 z-10 ${isDarkMode ? 'bg-black' : 'bg-white'} p-2 rounded-lg`}>
            <EmojiPicker onEmojiClick={onEmojiClick}/>
        </div>
        )}
    </div>
  )
}

export default EmogiPicker