import React, { useState,useRef } from 'react'
import { MdAdd, MdEdit } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { IoRemoveCircle } from "react-icons/io5";
import { useChat } from '../../context/ChatContext';
import axios from 'axios';
import UserSearch from './UserSearch';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { CiUser } from 'react-icons/ci';
import Lottie from 'react-lottie';
import spinnerAnimation from '../../animation/Spinner.json';

const UpdateGroupModal = ({fetchAgain,setFetchAgain,fetchMessages}) => {
  const backendURL = "https://chat-app-mern-backend-0e7i.onrender.com/api/v1/";
  const [editGroupName,setEditGroupName] = useState(false);
  const [groupName,setGroupName] = useState("");
  const [isAddUserToGroup,setIsAddUserToGroup] = useState(false);
  const [loading,setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const grpPhoto = useRef(null);
  const {chats,setChats} = useChat();
  const {selectedChat,setSelectedChat} = useChat();
  const [groupPhoto , setGroupPhoto] = useState(null);
  const [groupPhotoPreview , setGroupPhotoPreview] = useState(selectedChat.groupPhoto);
  const {id} = useSelector((state) => state.user);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: spinnerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const toggleEditGroupName = () => {
    setEditGroupName(!editGroupName);
  }
  const toggleAddUserToGroup = () => {
    setIsAddUserToGroup(!isAddUserToGroup);
  }

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    setGroupPhoto(file);
    setGroupPhotoPreview(URL.createObjectURL(file));
  }

  const handleUpdateGroupPhoto = async (e) => {
    e.preventDefault();
    if (!groupPhoto) {
      toast.error("Please select a photo first!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('groupPhoto', groupPhoto);
    formData.append('chatId', selectedChat._id);

    try {
      const res = await axios.put(
        `${backendURL}chats/change-group-photo`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.success === false) {
        setLoading(false);
        toast.error("Failed to update group photo!");
        return;
      }

      setSelectedChat(res.data.data);
      setFetchAgain(!fetchAgain);
      setLoading(false);

      toast.success("Group photo updated successfully");
    } catch (error) {
      console.error("Error updating group photo:", error.message);
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if(!groupName){
        return;
    }
    try {
        const res = await axios.put(`${backendURL}chats/rename-group`,{chatId : selectedChat._id, chatName : groupName},{withCredentials:true});

        if(res.data.success === false){
            toast.error("name not changed!");
            return;
        }

        setSelectedChat(res.data.data);
        setGroupName('');
        toggleEditGroupName();
        setFetchAgain(!fetchAgain);
        toast.success("Group name updated successfully");

    } catch (error) {
        console.log("error : ",error.message);
        toast.error(error.message);
        return;
    }
  }

  const handleAddToGroup = async (userToAdd) => {
    if(selectedChat.users.find((user) => user._id === userToAdd._id)){
        console.log("user is already in group");
        return;
    }

    if(selectedChat.groupAdmin._id !== id){
        console.log("only admin can add and remove members");
        return;
    }

    try {
        const res = await axios.put(
            `${backendURL}chats/group-add`,
            {chatId : selectedChat._id,userId:userToAdd._id},
            {withCredentials:true}
        );

        if(res.data.success === false){
            toast.error("user not added!");
            return;
        }

        console.log(res.data.data);
        setSelectedChat(res.data.data);
        setFetchAgain(!fetchAgain);
        toast.success("user added successfully")
    } catch (error) {
        console.log("error :",error.message);
        toast.error(error.message);
        return;
    }
  }

  const handleRemove = async (userToRemove) => {
    if(selectedChat.groupAdmin._id !== id && userToRemove._id !== id){
        console.log("only admin can add and remove members");
        return;
    }
    try {
        const res = await axios.put(
            `${backendURL}group-remove`,
            {chatId : selectedChat._id,userId:userToRemove._id},
            {withCredentials:true}
        );
        console.log(res.data.data);
        userToRemove._id === id ? setSelectedChat() : setSelectedChat(res.data.data);
        setFetchAgain(!fetchAgain);
        fetchMessages();
    } catch (error) {
        console.log("error :",error.message);
        return;
    }
  }


  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (!query) {
        setSearchResult([]);
        return;
    }

    try {
        const res = await axios.get(`${backendURL}chats/search?search=${query}`,{withCredentials:true});
        console.log(res.data.data);
        setSearchResult(res.data.data);
    } catch (error) {
        console.log("error : ", error,message);
        return;
    }
  }


  return (
    <>
    {
        !loading ? 
        (<div className='flex flex-col m-4'>
            <div className="cursor-pointer text-center" >
                <form action="" onSubmit = {handleUpdateGroupPhoto} encType='multipart/form-data' >
                    <img
                        src={groupPhotoPreview}
                        alt="Group Photo"
                        className="w-24 h-24 rounded-full mx-auto mb-2"
                        onClick={() => grpPhoto.current.click()}
                    />
                    <input
                        type="file"
                        hidden
                        ref={grpPhoto}
                        onChange={handleSelectImage}
                    />
                    { groupPhoto &&
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                            type = 'submit'
                        >
                            Update Group Photo
                        </button>
                    }
                </form>
            </div>
            <div className="flex items-center gap-3 justify-center font-semibold text-center">
                {editGroupName ? (
                        <div className=''>
                            <form onSubmit={handleRename} className='flex gap-3 justify-start items-center'>
                                <div className='relative flex items-center'>
                                    <input 
                                        type="text" 
                                        placeholder='Enter Group Name'
                                        value={groupName}
                                        className='bg-transparent outline-none border border-blue-800 px-6 py-2 rounded-lg '
                                        onChange={(e) => setGroupName(e.target.value)} 
                                    />
                                    <FaTimes className='absolute right-2 cursor-pointer text-red-600' onClick={toggleEditGroupName}/>
                                </div>
                                <button 
                                    type='submit'
                                    className='px-4 py-2 bg-blue-700 rounded-xl'
                                >
                                    update
                                </button>
                            </form>
                        </div>
                    ) : isAddUserToGroup ? 
                    (   <>
                            <div className='relative flex items-center'>
                                <input 
                                    type="text" 
                                    placeholder='Search users'
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className='bg-transparent outline-none border border-blue-800 px-6 py-2 rounded-lg ' 
                                />
                                <FaTimes className='absolute right-2 cursor-pointer text-red-600' onClick={toggleAddUserToGroup}/>
                            </div>
                            <div>
                                {searchResult &&
                                    searchResult?.slice(0,4).map(user => (
                                        <div key={user._id} onClick = {() => handleAddToGroup(user)}
                                        >
                                            <UserSearch 
                                                key={user._id}
                                                user={user}
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        </>
                    ) 
                    :(
                        <div className='flex items-center w-full mt-3'>
                            <div className='flex flex-1 gap-1'>
                                <span className="text-3xl text-purple-400 text-center">{selectedChat.chatName}</span>
                                <MdEdit className="cursor-pointer text-lg" onClick={toggleEditGroupName} />
                            </div>
                            <div className=''>
                                <MdAdd  
                                    className='text-2xl rounded-full text-black bg-green-400 mr-3'
                                    onClick={toggleAddUserToGroup}
                                />
                            </div>
                    </div>
                    )
                }
            </div>
            {/* <div className="text-sm text-gray-500 mb-2 text-center">Group Chat</div> */}
            {/* List all users in the group */}
            <div className="text-sm mt-4">
                {selectedChat.users.map((user) => (
                    <div key={user._id} className="flex gap-3 mb-4 bg-blue-950 p-3 rounded-xl">
                        <div className='w-14 h-14 rounded-full'>
                            {
                                user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.username}
                                    className="w-14 h-14 object-cover rounded-full mr-2"
                                />
                                ):(
                                    <CiUser className='w-14 h-14 text-white rounded-full border p-1'/>
                                )
                            }
                        </div>
                        <div className='flex flex-col flex-1 justify-start gap-1'>
                            <p className='text-lg font-extrabold text-yellow-400'>{user.username}</p>
                            <p className='text-gray-400'>{user.email}</p>
                        </div>
                        <div 
                            className='flex items-center justify-end text-4xl cursor-pointer text-red-500'
                            onClick={() => handleRemove(user)}
                        >
                            <IoRemoveCircle/>
                        </div>
                    </div>
                ))}
            </div>
        </div>)
        :
        (
            <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center'>
            <Lottie
              options={defaultOptions}
              width={100}
              height={100}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        )
    }
    </>
  )
}

export default UpdateGroupModal
