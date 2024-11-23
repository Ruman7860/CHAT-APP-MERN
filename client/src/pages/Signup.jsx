import React, { useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext';
import { CiUser } from "react-icons/ci";
import { MdPhotoSizeSelectActual } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';
import Lottie from 'react-lottie';
import spinnerAnimation from '../animation/Spinner.json';


const Signup = () => {

  const backendURL = "https://chat-app-mern-backend-0e7i.onrender.com/api/v1/";

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: spinnerAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [loading,setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic,setProfilePic] = useState(null);
  const [error,setError] = useState({
    usernameError:false,
    emailError:false,
    passwordError:false,
    profileError:false
  });
  
  const profile = useRef(null);
  
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError({
        usernameError: !username,
        emailError: !email,
        passwordError: !password,
      });
      return;
    }
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePic) {
      formData.append('profilePic', profile.current.files[0]);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendURL}auth/signup`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if(res.data.success === false){
        console.log(res.data.message);
        toast.error(res.data.message);
        return;
      }
      console.log(res.data.message);
      setLoading(false);
      toast.success("signup successfull! Now login");
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      setLoading(false);
      toast.error(error.message);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if(file.type.startsWith('image/')){
      setProfilePic(URL.createObjectURL(file));
      setError((prev) => ({...prev,profileError:false}))
    }
    else{
      setError((prev) => ({...prev,profileError:true}))
    }
  }

  return (
    <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {
        !loading ? 
        (<div className={`p-6 rounded-xl m-6 shadow-md w-full max-w-md ${isDarkMode ? 'shadow-red-500 shadow-[0px_4px_20px_rgba(0,0,0,0.5)]' : 'shadow-gray-500 shadow-[0px_0px_2px_rgba(0,0,0,0.5)]'}`}>
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
  
          <form onSubmit={handleSignup} name='profilePic' encType='multipart/form-data' className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full border border-red flex items-center justify-center overflow-hidden mb-6">
              {
                profilePic ? 
                <img className="object-cover w-40 h-40" src={profilePic} alt="Profile" />
                :
                <CiUser className='w-full h-full'/>
              }
            </div>
              {error.profileError && <p className='text-sm text-red-400'>selected file is not image</p> }
            <div>
              <input hidden type="file" ref={profile} onChange={handleProfilePicChange} />
              <button 
                onClick={() => profile.current.click()}
                className='rounded-full text-2xl'
              >
                <MdPhotoSizeSelectActual/>
              </button>
            </div>
  
            <div className="mb-4 w-full">
              <label className="block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
              />
              {error.usernameError && <p className='text-sm text-red-400'>Username is Required Field</p> }
            </div>
  
            <div className="mb-4 w-full">
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
              />
              {error.emailError && <p className='text-sm text-red-400'>Email is Required Field</p> }
            </div>
  
            <div className="mb-4 w-full">
              <label className="block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
              />
              {error.passwordError && <p className='text-sm text-red-400'>Password is Required Field</p> }
            </div>
            
            <button
              type="submit"
              className={`w-full p-2 rounded text-white font-semibold ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
            >
              Sign Up
            </button>
          </form>
  
          <p className='mt-2'>Already have account? {" "} 
              <a onClick={() => navigate('/login') } className='underline cursor-pointer'>Login</a>  
          </p>
  
          <div className='flex justify-center'>
            <button 
              onClick={toggleDarkMode} 
              className="mt-4 p-2 text-xl"
            >
              {isDarkMode ? <MdOutlineLightMode /> : <MdDarkMode/>}
            </button>
          </div>
        </div>):
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
    </div>
  )
}

export default Signup
