import React, { useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import axios from 'axios';
import UserSearch from './UserSearch';
import UserBadge from './UserBadge';
import { useChat } from '../../context/ChatContext';
import toast from 'react-hot-toast';
import { CiUser } from 'react-icons/ci';

const GroupModal = ({onClose}) => {
  const backendURL = 'http://localhost:3000/api/v1/';
  const {isDarkMode} = useTheme();
  const [groupName,setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [grpPic,setGrpPic] = useState(null);
  const [grpPicPreview,setGrpPicPreview] = useState(null);
  const {chats,setChats} = useChat();
  const groupPhoto = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        setGrpPic(file);
        setGrpPicPreview(URL.createObjectURL(file));
    }
  }

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (!query) {
        setSearchResult([])
        return;
    }

    try {
        const res = await axios.get(`${backendURL}chats/search?search=${query}`,{withCredentials:true});
        console.log(res.data.data);
        setSearchResult(res.data.data);
    } catch (error) {
        toast.error("error : ", error,message);
        return;
    }
  }

  const handleAddToGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
        return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  }

  const handleDelete = (userToDelete) => {
    setSelectedUsers(selectedUsers?.filter((user) => user._id !== userToDelete._id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!groupName || !selectedUsers){
        toast.error('please fill all fields');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('name', groupName);
        formData.append('users', JSON.stringify(selectedUsers.map((u) => u._id)));
        if (grpPic) {
            formData.append('groupPhoto', grpPic);
        }
        const res = await axios.post(
            `${backendURL}chats/group`,
            formData,
            {
              withCredentials:true,
              headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        if(res.data.success === false){
            toast.error("Group not formed!");
            return;
        }
        setChats([res.data.data,...chats]);
        onClose();
        toast.success("Group formed successfully");
    } catch (error) {
        console.error("Error:", error.res?.data?.message || error.message);
        toast.error(error.message);
        return;
    }
  }
  
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
  <div
    className={`${
      isDarkMode ? 'bg-black text-white' : 'bg-gray-200 text-black'
    } p-4 sm:p-6 rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto`}
  >
    <form action="" onSubmit={handleSubmit} encType='multipart/form-data' >
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
        Create Group Chat
      </h2>
      {/* Group Profile Pic */}
      <div className='flex flex-col justify-center rounded-full items-center'>
        {
            grpPic ? 
            <img src={grpPicPreview} className='text-center w-24 h-24 rounded-full p-1 m-4' />
            :
            <CiUser className='text-center text-7xl border rounded-full p-1 m-4'/>
        }
        <input ref={groupPhoto} accept='' type="file" hidden onChange={handleImageSelect} />
        <button 
            className='border rounded-lg p-2 mb-4'
            onClick={() => groupPhoto.current.click()}
        >Choose pic</button>
      </div>
      {/* Group Name Input */}
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        className={`w-full mb-3 p-2 border ${
          isDarkMode ? 'border-blue-400' : 'border-black'
        } outline-none bg-transparent rounded-lg`}
        onChange={(e) => setGroupName(e.target.value)}
      />
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        className={`w-full mb-3 p-2 border ${
          isDarkMode ? 'border-blue-400' : 'border-black'
        } outline-none bg-transparent rounded-lg`}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {/* Selected Users */}
      {selectedUsers &&
        selectedUsers.map((user) => (
          <UserBadge
            key={user._id}
            user={user}
            handleDelete={() => handleDelete(user)}
          />
        ))}
      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create
        </button>
      </div>
    </form>
    {/* Showing Search Results */}
    <div className="mt-4">
      {searchResult &&
        searchResult.slice(0, 4).map((user) => (
          <div key={user._id} onClick={() => handleAddToGroup(user)}>
            <UserSearch key={user._id} user={user} />
          </div>
        ))}
    </div>
  </div>
</div>
  )
}

export default GroupModal