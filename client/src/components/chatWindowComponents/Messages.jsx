import React, { useEffect, useState } from 'react'
import { CiUser } from 'react-icons/ci';
import { useSelector } from 'react-redux'
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import Tooltip from '../../utils/Tooltip';
import { FaFile, FaTimes, FaFileExcel, FaDownload } from 'react-icons/fa';
import ImagePreview from '../miscellaneous/ImagePreview';
import { MdDelete } from 'react-icons/md';
import MessageLoader from '../../utils/MessageLoader';

const Messages = ({ messages, setMessages }) => {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const { id } = useSelector((state) => state.user);
  const { isDarkMode } = useTheme();
  const [menuData, setMenuData] = useState({ isVisible: false, image: '', messageId: '', position: { x: 0, y: 0 } });
  const [previewImage, setPreviewImage] = useState('');
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const handleSelectMessage = (messageId) => {
    setSelectedMessageId((prevId) => (prevId === messageId ? null : messageId));
  };

  const handleImageClick = (messageId, image, event) => {
    // If the clicked image is the same as the current one, toggle the menu visibility
    if (menuData.isVisible && menuData.image === image) {
      setMenuData({ ...menuData, isVisible: false });
    } else {
      const rect = event.target.getBoundingClientRect();
      setMenuData({
        isVisible: true,
        image,
        messageId,
        position: { x: rect.left, y: rect.top },
      });
    }
  };
  const handlePreview = () => {
    setPreviewImage(menuData.image);
    setMenuData({ ...menuData, isVisible: false });
  };

  const closePreview = () => {
    setPreviewImage('');
  };

  const handleDelete = () => {
    setShowDeleteBtn(!showDeleteBtn)
  }

  const handleDownload = async (fileURL, fileName = 'download') => {
    try {
      const response = await fetch(fileURL);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName; // Default file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
    setMenuData({ ...menuData, isVisible: false });
  };

  // return true -> when next msg is from otherUser.
  // return false -> when next msg is from sameUser.
  const isNextMsgFromOtherUser = (msgs, currMssg, currMssgIndex, loggedInUserId) => {
    return currMssgIndex < msgs.length - 1 &&
      (msgs[currMssgIndex + 1].sender._id !== currMssg.sender._id || msgs[currMssgIndex + 1].sender._id === undefined) &&
      msgs[currMssgIndex].sender._id !== loggedInUserId
  }

  const isLastMessage = (msgs, currMssgIndex, loggedInUserId) => {
    return (
      currMssgIndex === msgs.length - 1 &&
      msgs[msgs.length - 1].sender._id !== loggedInUserId &&
      msgs[msgs.length - 1].sender._id
    );
  }

  // Delete message handler
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await axios.delete(`${backendURL}/api/v1/messages/${messageId}`, { withCredentials: true });

      if (response.data.success) {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
      }

      setMenuData({ ...menuData, isVisible: false, messageId: '', image: '' });
      setSelectedMessageId(null);
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  return (
    <div className='p-4 flex flex-col' id="messages-container">
      {messages && messages.map((msg, index) => (
        <div key={index} className="flex gap-1 mb-2">
          {(isNextMsgFromOtherUser(messages, msg, index, id) || isLastMessage(messages, index, id)) && (
            msg.sender.profilePic ? (
              <Tooltip content={msg.sender.username}>
                <img className='h-10 w-10 rounded-full' src={msg.sender.profilePic} alt="Profile" />
              </Tooltip>
            ) : (
              <Tooltip content={msg.sender.username}>
                <CiUser className='h-10 w-10 rounded-full bg-gray-600 p-2' />
              </Tooltip>
            )
          )}
          <p onClick={() => handleSelectMessage(msg._id)}
            className={
              ` max-w-[75%] rounded-xl shadow-lg group relative
              ${msg.image || msg.file ? 'p-2' : 'px-4 py-2'}
              ${!isLastMessage(messages, index, id) &&
                !isNextMsgFromOtherUser(messages, msg, index, id) &&
                msg.sender._id !== id ?
                'ml-11' :
                ''
              }
              ${msg.sender._id === id
                ? `${isDarkMode ? 'bg-[#148f77] text-white' : 'bg-cyan-300 '} self-end ml-auto`
                : `${isDarkMode ? 'bg-[#5d6d7e] text-white' : 'bg-white'}   self-start mr-auto`
              }`
            }
          >
            {msg.isLoading && <MessageLoader />}
            {
              msg.image &&
              <img
                src={msg.image}
                className='h-auto sm:w-40 md:w-60'
                alt=""
                onClick={(e) => handleImageClick(msg._id, msg.image, e)}
              />
            }
            {
              msg.file && msg.fileType && msg.fileType.startsWith('audio/') && (
                <audio controls src={msg.file} className="w-full min-w-[300px]" />
              )
            }
            {
              msg.file && msg.fileType === 'application/pdf' && (
                <div className="relative group w-full">
                  <iframe
                    src={msg.file}
                    className="w-full h-[400px]"
                  />

                  <button
                    onClick={() => handleDownload(msg.file, "document.pdf")}
                    className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Download
                  </button>
                </div>
              )
            }
            {msg.file &&
              ["application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
              ].includes(msg.fileType) && (
                <div className="relative group w-full">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                      msg.file
                    )}&embedded=true`}
                    className="w-full h-[400px]"
                  />

                  <button
                    onClick={() => handleDownload(msg.file)}
                    className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    Download
                  </button>
                </div>
              )}
            {msg.file &&
              msg.fileType ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && (
                <div className="flex items-center min-w-[300px] justify-center gap-3 bg-[#2b2b2b] text-white p-3 rounded-xl">
                  {/* Left: Excel icon + info */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-green-600 p-2 rounded-md">
                      <FaFileExcel className="text-white text-xl" />
                    </div>

                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate max-w-[320px]">
                        {msg.fileName || "Excel File.xlsx"}
                      </span>
                      <span className="text-xs text-gray-300">
                        Spreadsheet
                      </span>
                    </div>
                  </div>

                  {/* Right: Download icon */}
                  <button
                    onClick={() => handleDownload(msg.file, msg.fileName || "file.xlsx")}
                    className="p-2 rounded-full hover:bg-white/10 transition"
                    title="Download"
                  >
                    <FaDownload className="text-lg" />
                  </button>
                </div>
              )}

            <span onClick={handleDelete}>{msg.content}</span>
          </p>
          {selectedMessageId === msg._id && msg.sender._id === id && !msg.image && (
            <button
              className="text-red-500 text-sm ml-2"
              onClick={() => handleDeleteMessage(msg._id)}
            >
              <MdDelete />
            </button>
          )}
        </div>
      ))}

      {menuData.isVisible && (
        <div
          className={`absolute ${isDarkMode ? 'bg-black' : 'bg-white'} shadow-xl rounded-xl p-2 z-50`}
          style={{ top: menuData.position.y, left: menuData.position.x }}
        >
          <div>
            <FaTimes className='mb-2 text-red-400' onClick={() => setMenuData({ ...menuData, isVisible: false })} />
            <button
              className={`block px-3 py-1 rounded-lg ${isDarkMode ? 'hover:bg-amber-800' : 'hover:bg-slate-200'} w-full text-left`}
              onClick={handlePreview}
            >
              Preview
            </button>
            <button
              className={`block px-3 py-1 rounded-lg ${isDarkMode ? 'hover:bg-amber-800' : 'hover:bg-slate-200'} w-full text-left`}
              onClick={() => handleDownload(menuData.image || menuData.file)}
            >
              Download
            </button>
            <button
              className={`block px-3 py-1 text-red-600 rounded-lg ${isDarkMode ? 'hover:bg-amber-800' : 'hover:bg-slate-200'} w-full text-left`}
              onClick={() => handleDeleteMessage(menuData.messageId)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {previewImage && (
        <ImagePreview previewImage={previewImage} closePreview={closePreview} handleDownload={handleDownload} />
      )}
    </div>
  )
}

export default Messages
