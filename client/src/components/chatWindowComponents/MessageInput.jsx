import React, { useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { IoSend } from 'react-icons/io5';
import axios from 'axios';
import { useChat } from '../../context/ChatContext';
import EmojiPicker from 'emoji-picker-react';
import { FaSmile, FaTimes } from 'react-icons/fa';
import { FaImage } from "react-icons/fa";
import { FaFile } from "react-icons/fa6";
import Tooltip from '../../utils/Tooltip';

const MessageInput = ({sendMessage,newMessage,typingHandler,setNewMessage,setImage,setImagePreview,setFile}) => {
  const {isDarkMode} = useTheme();
  const [showEmojiPicker,setShowEmojiPicker] = useState(false);
  const photo = useRef(null);
  const fileRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const toggleEmogiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  }
  
  const onClickEmogi = (emojiData) => {
    setNewMessage(newMessage + emojiData.emoji);
  }

  const handleImageSend = () => {
    console.log("for images");
    photo.current.click();
  }
  const handleFileSend = () => {
    console.log("for files");
    fileRef.current.click();
  }

  const handleImage = (e) => {
    setImage(e.target.files[0]);
    console.log(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
    setImagePreviewUrl(URL.createObjectURL(e.target.files[0]));
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    console.log(selectedFile); // Ensure this logs the file object
  };

  return (
    <form 
      className='flex relative items-center w-full p-2 mb-3'
      onSubmit={sendMessage}
      encType='multipart/form-data'
    >
      {/* for sending files */}
      {/* <div>
        <Tooltip content="Send File">
          <FaFile
            onClick={handleFileSend}
            className={`cursor-pointer ${isDarkMode ? 'text-gray-500' : ''} mr-2 text-2xl`} 
          />
        </Tooltip>
        <input type="file" name='file' hidden ref={fileRef} onChange={handleFileChange} />
      </div> */}

      {/* for sending images */}
      <div>
        <Tooltip content="Send Image">
          <FaImage
            onClick={handleImageSend}
            className={`cursor-pointer ${isDarkMode ? 'text-gray-500' : ''} mr-2 text-2xl`} 
          />
        </Tooltip>
        <input type="file" name='image' hidden ref={photo} onChange={handleImage} />
      </div>

      {/* for sending emoji */}
      <div>
        <Tooltip content="Add Emoji">
          <FaSmile 
            className={`cursor-pointer ${isDarkMode ? 'text-gray-500' : ''} mr-2 text-2xl`}
            onClick={toggleEmogiPicker} 
          />
        </Tooltip>
        {/* Emoji Picker */}
        {showEmojiPicker && (
        <div className={`absolute bottom-14 left-1 z-10 ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-lg`}>
            <EmojiPicker theme={isDarkMode ? 'dark' : 'light'} onEmojiClick = {onClickEmogi} />
        </div>
        )}
      </div>

      {/* input field */}
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={typingHandler}
        className={`flex-1  px-2 py-3 text-[1.1rem] outline-none rounded-3xl ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black border border-gray-400'}`}
      />
        
      {/* Send Button */}
      <button
        className={`ml-2 p-2 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
        type='submit'
      >
        <IoSend className='text-xl'/>
      </button>

      {imagePreviewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-center items-center"
        >
          <div className={`relative bg-black p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full max-h-80 object-cover rounded-xl p-1 mt-2"
            />
            <div className="absolute top-1 right-1 flex">
              <button
                onClick={() => setImagePreviewUrl(null)} // Close modal
                className="text-red-600 text-xl font-bold"
              >
                <FaTimes/>
              </button>
            </div>
            <div className="flex justify-between items-center mt-3 mb-0 p-2">
              <button
                type="button"
                onClick={() => setImagePreviewUrl(null)} // Remove the image preview
                className="text-red-600 text-lg"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={sendMessage} // Send the message with the image
                className="text-blue-600 text-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

export default MessageInput
