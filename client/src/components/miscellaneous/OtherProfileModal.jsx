import React from 'react'
import { FaTimes } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext'
import { useSelector } from 'react-redux';
import UpdateGroupModal from './UpdateGroupModal';

const OtherProfileModal = ({selectedChat,onClose,fetchAgain,setFetchAgain,fetchMessages}) => {
  const { isDarkMode } = useTheme();
  const {id} = useSelector((state) => state.user);

  const getUserProfileInfo = () => {
    if (selectedChat.isGroupChat) {
      // Return group info
      return {
        name: selectedChat.chatName,
        // profilePic: selectedChat.groupPic,  // Group Picture
        isGroup: true,
        users: selectedChat.users,  // List of all users in the group
      };
    } else {
      // Return one-on-one user info
      const otherUser = selectedChat.users.find(user => user._id !== id);
      return {
        name: otherUser.username,
        email : otherUser.email,
        profilePic: otherUser.profilePic,
        isGroup: false,
      };
    }
  };
  const { name, profilePic, isGroup, users,email } = getUserProfileInfo();

  return (
    <div className="fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className={`${isDarkMode ? 'bg-black text-white' : 'bg-gray-200 text-black'} p-4 sm:p-6 rounded-lg w-11/12 max-w-lg max-h-[90vh] overflow-y-auto`}
      >
        <div className="mb-4 relative">
          {/* Close Button */}
          <div className="absolute top-1 right-1 translate-x-2 -translate-y-4">
            <FaTimes
              className="text-xl  sm:text-2xl cursor-pointer text-red-500 bg-red-300 rounded-full p-1 hover:bg-red-400"
              onClick={onClose}
            />
          </div>
          {/* Display Group Info */}
          {isGroup ? (
            <UpdateGroupModal
              selectedChat={selectedChat}
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              fetchMessages={fetchMessages}
            />
          ) : (
            // Display one-on-one user info
            <>
              <img
                src={profilePic}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4"
              />
              <div className="text-center">
                <h2
                  className={`${
                    isDarkMode ? 'text-yellow-400' : 'text-amber-950'
                  } font-extrabold text-lg sm:text-xl`}
                >
                  {name}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">{email}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OtherProfileModal