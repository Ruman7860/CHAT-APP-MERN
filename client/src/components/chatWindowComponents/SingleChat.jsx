import React, { useEffect, useState } from 'react'
import { useChat } from '../../context/ChatContext'
import ChatHeader from './ChatHeader';
import ScrollableFeed from 'react-scrollable-feed'
import Lottie from 'react-lottie';
import MessageInput from './MessageInput';
import Messages from './Messages';
import axios from 'axios';
import io from 'socket.io-client'
import { useSelector } from 'react-redux';
import animationData from '../../animation/typingAnimation.json';
import { useTheme } from '../../context/ThemeContext';

const ENDPOINT = "https://chat-app-mern-backend-0e7i.onrender.com"; // backend endpoint
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
  const backendURL = "https://chat-app-mern-backend-0e7i.onrender.com/api/v1/";
  const {selectedChat,notifications,setNotifications} = useChat();
  const [messages,setMessages] = useState([]);
  const [newMessage,setNewMessage] = useState('');
  const [socketConnected,setSocketConnected] = useState(false);
  const [typing,setTyping] = useState(false);
  const [isTyping,setIsTyping] = useState(false);
  const [image,setImage] = useState(null);
  const [imagePreview,setImagePreview] = useState(null);
  const [file,setFile] = useState(null);
  const {id} = useSelector((state) => state.user);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };



  const sendMessage = async (e) => {
    e.preventDefault();
    socket.emit('stop-typing',selectedChat._id);

    const formData = new FormData();
    formData.append('content',newMessage);
    formData.append('chatId',selectedChat._id);
    if(image){
      console.log(image)
      formData.append('file',image);
    }
    if(file){
      console.log(file);
      formData.append('file',file);
    }

    try {
      const res = await axios.post(
        `${backendURL}messages`,
        formData,
        {
          withCredentials:true,
          headers: {'Content-Type': 'multipart/form-data',},
        }
      );
      setNewMessage('');
      setImage(null);
      setFile(null);
      setImagePreview(null); // Clear the preview after sending
      socket.emit('new-message',res.data.data);
      // setMessages([...messages,res.data.data]);
      setMessages((prevMessages) => [...prevMessages, res.data.data]);
    } catch (error) {
      console.log("error :",error);
      return;
    }
  }
  
  const fetchMessages = async () => {
    if(!selectedChat){
        return;
    }

    try {
      const res = await axios.get(`${backendURL}messages/${selectedChat._id}`, { withCredentials: true });
        
      // setMessages(res.data.data);
      setMessages((prevMessages) => {
        const fetchedMessages = res.data.data;
        const uniqueMessages = [
          ...prevMessages.filter(
            (msg) => !fetchedMessages.some((fetched) => fetched._id === msg._id)
          ),
          ...fetchedMessages,
        ];
        return uniqueMessages;
      });
      // loggedIn user room join or chat krne ke lia
      socket.emit('join-chat',selectedChat._id);
    } catch (error) {
      console.log("error :",error.message);
      return;
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT,{withCredentials:true,transports: ['websocket']});
    socket.emit('setup',id);
    socket.on("connected",() => setSocketConnected(true));
    socket.on('typing',() => setIsTyping(true));
    socket.on('stop-typing',() => setIsTyping(false));
  },[])

  // useEffect(() => {
  //   socket.on("message-recieved", (newMessageRecieved) => {
  //     if (
  //       !selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
  //       // if (!notifications.includes(newMessageRecieved)) {
  //       //   setNotifications([newMessageRecieved, ...notifications]);
  //       //   setFetchAgain(!fetchAgain);
  //       // }
  //     } else {
  //       setMessages([...messages, newMessageRecieved]);
  //     }
  //   });
  // },[])

   useEffect(() => {
    socket.on("message-recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notifications.some((notif) => notif._id === newMessageRecieved._id)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => {
          if (!prevMessages.some((msg) => msg._id === newMessageRecieved._id)) {
            return [...prevMessages, newMessageRecieved];
          }
          return prevMessages;
        });
        setFetchAgain(!fetchAgain);
      }
    });
  }, [notifications, fetchAgain, selectedChatCompare]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat
  },[selectedChat]);


  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!e.target.value) {
      // If the input is cleared, emit 'stop-typing' immediately
      socket.emit("stop-typing", selectedChat._id);
      setTyping(false);
      return;
    }
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    // Remove previous timeout if there is any
    clearTimeout(window.typingTimeout);

    // Set a new timeout to stop typing if user stops typing for 3 seconds
    window.typingTimeout = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength) {
        socket.emit("stop-typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  }

  return (
    <>
        { selectedChat ?
            (<div className='flex flex-col h-screen'> 
                <ChatHeader fetchAgain = {fetchAgain} setFetchAgain = {setFetchAgain} fetchMessages = {fetchMessages} />

                {/* Main Chat Box */}
                <ScrollableFeed className='flex-1'>
                    <Messages messages = {messages} setMessages={setMessages} isTyping={isTyping} />
                </ScrollableFeed>
                {isTyping && (
                  <div className="mt-auto mb-0">
                    {/* <div className='mb-0'> */}
                      <Lottie
                        options={defaultOptions} 
                        width={70}
                        style={{ marginBottom: 0, marginLeft: 0 }}
                      />
                    {/* </div> */}
                  </div>
                )}

                {/* MessageInput */}
                <MessageInput 
                  sendMessage ={sendMessage} 
                  newMessage={newMessage} 
                  typingHandler={typingHandler} 
                  setNewMessage = {setNewMessage}
                  setImage = {setImage}
                  image = {image}
                  imagePreview = {imagePreview}
                  setImagePreview = {setImagePreview}
                  file = {file}
                  setFile = {setFile}
                />
            </div>) :(
            <div className='flex justify-center items-center h-screen'>
              <p className='text-xl'>Click on user to start chatting </p>
            </div>
            )
        }
    </>
  )
}

export default SingleChat
