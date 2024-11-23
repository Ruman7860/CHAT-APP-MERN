import React, { useState } from 'react'
import { FaPaperPlane, FaPlus, FaSmile, FaVideo, FaPhoneAlt, FaSearch, FaFile, FaImage } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useChat } from '../../context/ChatContext';
import { useSelector } from 'react-redux';
import OtherProfileModal from '../miscellaneous/OtherProfileModal';

const ChatHeader = ({fetchAgain,setFetchAgain,fetchMessages}) => {
  const {isDarkMode} = useTheme();
  const {id} = useSelector((state) => state.user);
  const [showUserProfile,setShowUserProfile] = useState(false);
  const {selectedChat,setSelectedChat} = useChat();
  const [otherUserInfo,setOtherUserInfo] = useState();

  const onClose = () => {
    setShowUserProfile(!showUserProfile);
  }

  const getChatNameAndProfilePic = (chat) => {
    if (chat.isGroupChat) {
      return {username : chat.chatName}; // Group Chat Name
    } else {
      // Find the user who is not the logged-in user
      const otherUser = chat.users.find((user) => user._id !== id);
      return {username : otherUser.username, profilePic : otherUser.profilePic};
    }
  };

  return (
    <div className={`p-4 border-b ${!isDarkMode && 'border-black'} flex gap-3 items-center`}>
      <div className={`md:hidden px-2 py-1 rounded-full cursor-pointer`}>
        <IoMdArrowRoundBack className='text-2xl' onClick={() => setSelectedChat("")}/>
      </div>
      <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-100'} rounded-full mr-2 flex items-center justify-center text-xl cursor-pointer`}
          onClick={onClose}
      >
        {getChatNameAndProfilePic(selectedChat).username[0].toUpperCase()}
      </div>
      <div className="font-extrabold text-xl flex-1">{getChatNameAndProfilePic(selectedChat).username}</div>
      <div className="flex gap-5 text-lg cursor-pointer">
        <FaVideo title="Video Call" />
        <FaPhoneAlt title="Audio Call" />
        <FaSearch title="Search" />
      </div>

      {showUserProfile &&
        <OtherProfileModal 
          fetchAgain={fetchAgain} 
          setFetchAgain = {setFetchAgain} 
          onClose = {onClose} 
          selectedChat = {selectedChat}
          fetchMessages = {fetchMessages}
        />}
    </div>
  )
}

export default ChatHeader