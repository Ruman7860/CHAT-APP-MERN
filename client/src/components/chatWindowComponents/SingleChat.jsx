import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import ScrollableFeed from 'react-scrollable-feed';
import Lottie from 'react-lottie';
import MessageInput from './MessageInput';
import Messages from './Messages';
import axios from 'axios';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import animationData from '../../animation/typingAnimation.json';
import Spinner from '../../animation/Spinner.json';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { selectedChat, notifications, setNotifications } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // Global upload spinner (kept for backward compatibility)

  const { id } = useSelector((state) => state.user);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const defaultOptionsSpinner = {
    loop: true,
    autoplay: true,
    animationData: Spinner,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !image && !file) {
      toast.error("Please type a message or select an image/file");
      return;
    }

    socket.emit('stop-typing', selectedChat._id);

    // Create temporary optimistic message
    const tempId = `temp-${Date.now()}`;
    const hasMedia = !!(image || file);

    const optimisticMessage = {
      _id: tempId,
      sender: { _id: id },
      content: newMessage.trim(),
      chat: selectedChat,
      createdAt: new Date().toISOString(),
      isLoading: hasMedia, // Only show loader if media is being uploaded
      // For preview during upload
      image: image ? URL.createObjectURL(image) : null,
      file: file ? {
        name: file.name,
        type: file.type,
        fileName: file.name
      } : null,
      fileType: file?.type,
      fileName: file?.name,
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // Clear input
    setNewMessage('');
    setImage(null);
    setFile(null);
    setImagePreview(null);

    // Prepare form data
    const formData = new FormData();
    formData.append('content', newMessage.trim());
    formData.append('chatId', selectedChat._id);
    if (image || file) {
      formData.append('file', image || file);
      setLoading(true); // Keep your global spinner if needed
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

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? res.data.data : msg
        )
      );

      // Emit to others
      socket.emit('new-message', res.data.data);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");

      // Remove failed message on error
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
      socket.emit('join-chat', selectedChat._id);
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  // Socket setup
  useEffect(() => {
    socket = io(ENDPOINT, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.emit('setup', id);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop-typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [id]);

  // Receive new messages
  useEffect(() => {
    socket.on('message-recieved', (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // Notification logic
        if (!notifications.some((n) => n._id === newMessageRecieved._id)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        // Add to current chat if not duplicate
        setMessages((prev) => {
          if (!prev.some((m) => m._id === newMessageRecieved._id)) {
            return [...prev, newMessageRecieved];
          }
          return prev;
        });
      }
    });

    return () => socket.off('message-recieved');
  }, [selectedChatCompare, notifications, fetchAgain, setNotifications, setFetchAgain]);

  // Fetch messages when chat changes
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // Typing handler
  const typingHandler = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!value.trim()) {
      socket.emit('stop-typing', selectedChat._id);
      setTyping(false);
      return;
    }

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    // Clear previous timeout
    if (window.typingTimeout) clearTimeout(window.typingTimeout);

    window.typingTimeout = setTimeout(() => {
      socket.emit('stop-typing', selectedChat._id);
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