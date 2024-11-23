import React, { useRef, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateUser } from '../../redux/userSlice.js';
import toast from 'react-hot-toast';
import Lottie from 'react-lottie';
import spinnerAnimation from '../../animation/Spinner.json';


const ProfileModal = ({onClose}) => {
  const backendURL = 'http://localhost:3000/api/v1/';
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: spinnerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const {isDarkMode} = useTheme();
  const {username:currentUsername,email:currentEmail,profilePic:currentProfilePic} = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const proPic = useRef(null);

  const [loading,setLoading] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(currentEmail);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file.type.startsWith('image/')){
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
    else{
      console.log("only image supported");
      return;
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (profilePic) formData.append('profilePic', profilePic);

    try {
      const response = await axios.put(
        `${backendURL}auth/update-profile`, 
        formData, 
        { 
          withCredentials : true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      dispatch(updateUser(response.data.user));
      setLoading(false);
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error.response?.data?.message || error.message);
      setLoading(false);
      toast.error('Failed to update profile');
    }
  };

  return (
    <>
      {
  !loading ? (
    <div className="fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className={`${
          isDarkMode ? "bg-black text-white" : "bg-gray-200 text-black"
        } p-4 sm:p-6 rounded-lg w-11/12 max-w-lg`}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Profile Information
        </h2>
        <form
          onSubmit={handleUpdate}
          name="update"
          encType="multipart/form-data"
          className="space-y-4"
        >
          {/* Profile Picture */}
          <div className="mb-4 text-center">
            <img
              src={
                profilePicPreview
                  ? profilePicPreview // Preview newly selected picture
                  : currentProfilePic
              }
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-2"
            />
            <input
              type="file"
              hidden
              accept="image/*"
              ref={proPic}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="px-3 py-1 rounded-lg border border-gray-400 text-sm sm:text-base"
              onClick={() => proPic.current.click()}
            >
              Choose Profile Pic
            </button>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm sm:text-base">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-2 border ${
                isDarkMode ? "border-blue-400" : "border-black"
              } outline-none bg-transparent rounded-lg text-sm sm:text-base`}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm sm:text-base">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border ${
                isDarkMode ? "border-blue-400" : "border-black"
              } outline-none bg-transparent rounded-lg text-sm sm:text-base`}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between sm:justify-end gap-4">
            <button
              onClick={onClose}
              type="button"
              className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm sm:text-base"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">
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

export default ProfileModal