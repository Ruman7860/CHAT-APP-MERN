import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice.js';
import Navbar from './chatListComponents/Navbar.jsx';
import Search from './chatListComponents/Search.jsx';
import MyChats from './chatListComponents/MyChats.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useChat } from '../context/ChatContext.jsx';
import toast from 'react-hot-toast';

const ChatList = ({ fetchAgain}) => {
  const backendURL = "https://chat-app-mern-backend-0e7i.onrender.com/api/v1/";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isDarkMode} = useTheme();
  const {selectedChat} = useChat();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${backendURL}auth/logout`,
        {}, // no data payload needed
        { withCredentials: true } // set `withCredentials` here
      );

      if(res.data.success === false){
        toast.error("Logged out unsuccessfully");
        return;
      }
      dispatch(logout());
      toast.success("Logged out successfully..");
      navigate('/login');
    } catch (error) {
      console.log("error occured : "+error.message);
      toast.error(error.message);
    }
  }

  // #fcf5eb

  return (
    <div className={`w-full md:w-1/3 lg:w-1/4 ${isDarkMode ? 'bg-gray-900 text-white ' : 'bg-[#fcf5eb] text-black border-r border-gray-500'} overflow-y-auto
    ${selectedChat && 'hidden md:block'} 
    `}>
      {/* Navbar */}
      <Navbar handleLogout = {handleLogout}/>

      {/* Search Bar */}
      <Search />

      {/* My Chats */}
      <MyChats fetchAgain = {fetchAgain}/>
    </div>
  )
}

export default ChatList
