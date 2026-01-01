import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useVideoCall } from '../../context/VideoCallContext'; // Import hook
import ChatHeader from './ChatHeader';
import ScrollableFeed from 'react-scrollable-feed';
import Lottie from 'react-lottie';
import MessageInput from './MessageInput';
import Messages from './Messages';
import axios from 'axios';
import { useSelector } from 'react-redux';
import animationData from '../../animation/typingAnimation.json';
import toast from 'react-hot-toast';

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
// Socket is now managed in Context, no global var here needed ideally, 
// but we used to have 'selectedChatCompare' used in effect.
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { selectedChat, notifications, setNotifications, socket } = useChat(); // Get socket from context
  const { startCall } = useVideoCall(); // Get call function

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useSelector((state) => state.user);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !image && !file) {
      toast.error("Please type a message or select an image/file");
      return;
    }

    if (socket) {
      socket.emit('stop-typing', selectedChat._id);
    }

    // Create temporary optimistic message
    const tempId = `temp-${Date.now()}`;
    const hasMedia = !!(image || file);

    const optimisticMessage = {
      _id: tempId,
      sender: { _id: id },
      content: newMessage.trim(),
      chat: selectedChat,
      createdAt: new Date().toISOString(),
      isLoading: hasMedia,
      image: image ? URL.createObjectURL(image) : null,
      file: file ? {
        name: file.name,
        type: file.type,
        fileName: file.name
      } : null,
      fileType: file?.type,
      fileName: file?.name,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Clear input
    setNewMessage('');
    setImage(null);
    setFile(null);
    setImagePreview(null);

    const formData = new FormData();
    formData.append('content', newMessage.trim());
    formData.append('chatId', selectedChat._id);
    if (image || file) {
      formData.append('file', image || file);
      setLoading(true);
    }

    try {
      const res = await axios.post(
        `${backendURL}/api/v1/messages`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? res.data.data : msg
        )
      );

      if (socket) {
        socket.emit('new-message', res.data.data);
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const res = await axios.get(
        `${backendURL}/api/v1/messages/${selectedChat._id}`,
        { withCredentials: true }
      );

      setMessages(res.data.data);
      if (socket) {
        socket.emit('join-chat', selectedChat._id);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  // Socket setup is now handled globally in VideoCallContext/App
  // We just listen to events when socket is ready.
  useEffect(() => {
    if (!socket) return;

    // We assume 'setup' event was called by Manager context
    setSocketConnected(true);

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop-typing', () => setIsTyping(false));

    return () => {
      // Don't disconnect socket here as it's global now!
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, [socket]);

  // Receive new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('message-recieved', (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notifications.some((n) => n._id === newMessageRecieved._id)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => {
          if (!prev.some((m) => m._id === newMessageRecieved._id)) {
            return [...prev, newMessageRecieved];
          }
          return prev;
        });
      }
    });

    return () => socket.off('message-recieved');
  }, [socket, selectedChatCompare, notifications, fetchAgain, setNotifications, setFetchAgain]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]); // Depend on socket? fetchMessages uses socket.

  // Re-run fetchMessages if socket connects late?
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join-chat', selectedChat._id);
    }
  }, [socket]);


  const typingHandler = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!value.trim()) {
      if (socket) socket.emit('stop-typing', selectedChat._id);
      setTyping(false);
      return;
    }

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      if (socket) socket.emit('typing', selectedChat._id);
    }

    if (window.typingTimeout) clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
      if (socket) socket.emit('stop-typing', selectedChat._id);
      setTyping(false);
    }, 3000);
  };

  if (!selectedChat) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-xl text-gray-500'>Click on a user to start chatting</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-screen'>
        <ChatHeader
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          fetchMessages={fetchMessages}
          onStartVideoCall={() => startCall(selectedChat, 'video')}
          onStartAudioCall={() => startCall(selectedChat, 'audio')}
        />

        <ScrollableFeed className='flex-1'>
          <Messages messages={messages} setMessages={setMessages} />
        </ScrollableFeed>

        {isTyping && (
          <div className="p-2">
            <Lottie options={defaultOptions} width={70} style={{ margin: 0 }} />
          </div>
        )}

        <MessageInput
          sendMessage={sendMessage}
          newMessage={newMessage}
          typingHandler={typingHandler}
          setNewMessage={setNewMessage}
          setImage={setImage}
          setImagePreview={setImagePreview}
          imagePreview={imagePreview}
          setFile={setFile}
        />
      </div>
    </>
  );
};

export default SingleChat;