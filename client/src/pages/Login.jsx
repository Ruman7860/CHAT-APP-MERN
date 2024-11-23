import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext';
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/userSlice.js';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {

  const backendURL = 'http://localhost:3000/api/v1/';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error,setError] = useState({
    emailError:false,
    passwordError:false,
  })
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if(!email){
      setError((prev) => ({...prev,emailError:true}));
      return;
    }
    if(!password){
      setError((prev) => ({...prev,passwordError:true}));
      return;
    }
    try {
      const res = await axios.post(`${backendURL}auth/login`,{email,password},{withCredentials: true});

      if(res.data.success === false){
        console.log("Not logging...");
        toast.error("Login unsuccessfull!")
        return;
      }

      const {_id:id,username,email: userEmail,profilePic} = res.data.user;
      dispatch(login({id,username,email: userEmail,profilePic}))
      toast.success('Login Successfull');
      navigate('/');
    } catch (error) {
      console.log("error occurred : " + error.message);
      toast.error(error.message);
      return;
    }
  };
  return (
    <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className={`p-6 rounded-xl m-4 shadow-lg w-full max-w-md ${isDarkMode ? 'shadow-red-500 shadow-[0px_4px_20px_rgba(0,0,0,0.5)]' : 'shadow-gray-500 shadow-[0px_2px_5px_rgba(10,0,0,0.5)]'}`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full p-2 rounded text-white font-semibold ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
          >
            Login
          </button>
        </form>

          <p className='mt-2'>Don't have account? {" "} 
            <a onClick={() => navigate('/signup') } className='underline cursor-pointer'>Signup</a>  
          </p>
        
          <div className='flex justify-center'>
          <button 
            onClick={toggleDarkMode} 
            className="mt-4 p-2 text-xl"
          >
            {isDarkMode ? <MdOutlineLightMode /> : <MdDarkMode/>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login