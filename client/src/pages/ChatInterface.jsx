import React, { useEffect, useState } from 'react'
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useChat } from '../context/ChatContext';

const ChatInterface = () => {
  const { isDarkMode} = useTheme();
  const [fetchAgain,setFetchAgain] = useState(false);

  return (
    <>
      <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'text-black'} flex h-screen`}>
            <div className="flex w-full">
                <ChatList fetchAgain = {fetchAgain} />
                <ChatWindow fetchAgain = {fetchAgain} setFetchAgain = {setFetchAgain} />
            </div>
      </div>
    </>
  )
}

export default ChatInterface