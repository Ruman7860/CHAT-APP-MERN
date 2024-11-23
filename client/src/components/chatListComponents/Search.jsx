import React, { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import axios from 'axios';
import { CiUser } from 'react-icons/ci';
import { useChat } from '../../context/ChatContext';
import UserSearch from '../miscellaneous/UserSearch';

const Search = () => {
  const backendURL = 'http://localhost:3000/api/v1/';
  const {isDarkMode} = useTheme();
  const [searchTerm,setSearchTerm] = useState('');
  const [searchResult,setSearchResult] = useState([]);
  const {selectedChat,setSelectedChat,chats,setChats} = useChat();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a valid search term');
      return;
    }
    try {
      const res = await axios.get(`${backendURL}chats/search?search=${searchTerm}`,{withCredentials:true});
      setSearchResult(res.data.data);
    } catch (error) {
      console.log("error occurred : ",  error.message);
      return;
    }
  }

  const accessChat = async (userId) => {
    try {
      const res = await axios.post(`${backendURL}chats/`,{userId : userId},{withCredentials:true});

      if(!chats.find((c) => c._id === res.data.data._id)){
        setChats([res.data.data,...chats]);
      }

      setSelectedChat(res.data.data);
      setSearchResult([]);
      setSearchTerm('');
    } catch (error) {
      console.log("error : ",error.message);
      return;
    }
  }

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
    }
  }, [searchTerm]);


  return (
    <div className="px-2 pb-2 flex flex-col">
      <div className='flex gap-2'>
        <input
          type="text"
          placeholder="Find the Users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full p-2 outline-none rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
        />
        <button 
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-rose-200'} p-2 rounded-lg`} 
          onClick = {handleSearch}
        >
          Go
        </button>
      </div>

      {
        searchResult ? 
          <div className="mt-4 border border-black">
            {searchResult.map((user) => (
              <UserSearch
                user = {user}
                key={user._id}
                handleAccess = {() => accessChat(user._id)}
              />
            ))}
        </div>:{}
      }
    </div>
  )
}

export default Search