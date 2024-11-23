import React, { useState } from 'react'
import { CiUser } from 'react-icons/ci';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { MdDarkMode, MdGroups2, MdOutlineLightMode } from 'react-icons/md';
import { IoIosNotifications } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import ProfileModal from '../miscellaneous/ProfileModal';
import GroupModal from '../miscellaneous/GroupModal';
import { useChat } from '../../context/ChatContext';
import Tooltip from '../../utils/Tooltip';

const Navbar = ({handleLogout}) => {
  const {id,username,profilePic} = useSelector((state) => state.user);
  const {isDarkMode,toggleDarkMode} = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const {selectedChat,setSelectedChat,notifications,setNotifications} = useChat();

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen); // Toggle modal visibility
  };
  const toggleGroupModal = () => {
    setIsGroupModalOpen(!isGroupModalOpen); // Toggle modal visibility
  };
  const toggleNotificationBox = () => {
    setIsNotificationOpen(!isNotificationOpen);  // Toggle notification box visibility
  };

  const getChatNameAndProfilePic = (notification) => {
    if (notification.chat.isGroupChat) {
      return {username : chat.chatName}; // Group Chat Name
    } else {
      // Find the user who is not the logged-in user
      const otherUser = notification.chat.users.find((user) => user._id !== id);
      return {username : otherUser.username, profilePic : otherUser.profilePic};
    }
  };

  return (
    <div className="p-3 flex gap-3 justify-between items-center cursor-pointer">
      {
        profilePic ? 
        <Tooltip content="Profile">
          <img 
            src={profilePic} 
            onClick={toggleProfileModal}
            className='w-16 h-16 rounded-full '
            alt=""
          />
        </Tooltip> :
        <Tooltip content="Profile">
          <CiUser onClick={toggleProfileModal} className='w-14 h-14 border border-gray-700 p-1 font-light rounded-full'/>
        </Tooltip>
      }
      <span className="font-bold flex-1 text-xl">{username}</span>
      <div className="flex items-center gap-4 text-xl cursor-pointer">
        <Tooltip content="Create Group">
          <MdGroups2
            className="text-xl cursor-pointer"
            title="Create Group"
            onClick={toggleGroupModal}
          />
        </Tooltip>
        <div className='relative'>
          {
            notifications.length > 0 && <span className='absolute right-0 text-orange-300 text-sm bg-orange-400 rounded-full h-4 w-4 text-center'>
              {notifications.length}
            </span>
          }
          <Tooltip content = "Notifications">
            <IoIosNotifications
              className='text-2xl cursor-pointer'
              onClick={toggleNotificationBox}
            />
          </Tooltip>
        </div>


        <Tooltip content="Switch mode">
          {isDarkMode ? (
            <MdOutlineLightMode onClick={toggleDarkMode}/>
          ) : (
            <MdDarkMode onClick={toggleDarkMode}/>
          )}
        </Tooltip>
        <Tooltip content="Logout">
          <FaSignOutAlt onClick={handleLogout}/>
        </Tooltip>
      </div>

      {isProfileModalOpen && <ProfileModal onClose={toggleProfileModal} />}
      {isGroupModalOpen && <GroupModal onClose={toggleGroupModal} />}

      {isNotificationOpen && (
        <div className={`absolute top-16 right-3 p-4 ${isDarkMode ? 'bg-gray-500' : 'bg-white shadow-xl'} shadow-lg w-80 rounded-lg max-h-96 overflow-y-auto`}>
          <div className='flex items-center justify-between mb-2'>
            <h3 className="font-bold text-xl">Notifications</h3>
            <FaTimes onClick={toggleNotificationBox} className='text-red-300'/>
          </div>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="p-2 border-b">
                <p onClick={() => {
                  setSelectedChat(notification.chat);
                  setNotifications(notifications.filter((nt) => nt !== notification))
                }}>
                  {notification.chat.isGroupChat ? (
                    <>
                      New Message in <span className="font-semibold text-yellow-700">{notification.chat.chatName}</span>
                    </>
                  ) : (
                    <>
                      New Message from <span className="font-semibold text-yellow-500">
                        {getChatNameAndProfilePic(notification).username}
                      </span>
                    </>
                  )}
                </p>
              </div>
            ))
          ) : (
            <p className='font-light'>No new notifications</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar