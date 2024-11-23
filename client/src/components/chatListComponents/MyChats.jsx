import React, { useEffect, useState } from 'react'
import { useChat } from '../../context/ChatContext';
import axios from 'axios';
import { CiUser } from 'react-icons/ci';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';

const MyChats = ({fetchAgain}) => {
  const backendURL = 'http://localhost:3000/api/v1/';
  const {isDarkMode} = useTheme();
  const {selectedChat,setSelectedChat,chats,setChats} = useChat();
  const {id} = useSelector((state) => state.user); // getting id of loggedIn user

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${backendURL}chats/`,{withCredentials:true});
      setChats(res.data.data);
    } catch (error) {
      console.log("error : ",error.message);
      return;
    }   
  }

  const getChatNameAndProfilePic = (chat) => {
    if (chat.isGroupChat) {
      return {groupName : chat.chatName,groupPhoto : chat.groupPhoto}; // Group Chat Name
    } else {
      // Find the user who is not the logged-in user
      const otherUser = chat.users.find((user) => user._id !== id);
      return {username:otherUser.username,profilePic:otherUser.profilePic};
    }
  };

  useEffect(() => {
    fetchChats();
  },[fetchAgain]);

  return (
    <div className={`${selectedChat ? 'sm:hidden' : 'flex'} md:flex flex-col p-3`}>
        {
            chats.length > 0 ? (
                chats.map(chat => (
                    <div 
                        key={chat._id} 
                        onClick={() => setSelectedChat(chat)}
                        className={`px-2 py-4 rounded-xl cursor-pointer mb-4 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-[#ffffffdc]'}`}
                    >
                        <div className='flex gap-4'>
                            {
                                getChatNameAndProfilePic(chat).profilePic || getChatNameAndProfilePic(chat).groupPhoto ?
                                <img 
                                    src={getChatNameAndProfilePic(chat).profilePic || getChatNameAndProfilePic(chat).groupPhoto} 
                                    className='w-12 h-12 rounded-full' 
                                /> :
                                <CiUser className='w-12 h-12 rounded-full'/>
                            }
                            <div>
                              <p>{getChatNameAndProfilePic(chat).username || getChatNameAndProfilePic(chat).groupName}</p>
                              <p className="text-sm text-gray-500">{chat?.latestMessage?.content}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>Search for User and Start Chating</p>
            )
        }
    </div>
  )
}

export default MyChats