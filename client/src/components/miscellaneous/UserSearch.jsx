import React from 'react'
import { CiUser } from 'react-icons/ci'
import { useTheme } from '../../context/ThemeContext'

const UserSearch = ({user,handleAccess}) => {
  const {isDarkMode} = useTheme();
  return (
    <div 
        key={user._id}  
        className={`p-2 mb-3 flex gap-3 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-[#ffffff]'} transition`}
        onClick={handleAccess}
    >
      <div className='rounded-full'>
        {user.profilePic ? 
          <img src={user.profilePic} className='w-12 h-12 rounded-full object-cover' alt="" /> 
            : 
          <CiUser className='w-12 h-12 font-light rounded-full'/>
        }
      </div>
      <div className='text-left'>
        <p className='text-sm'>{user.username}</p>
        <p className='text-sm font-light'>{user.email}</p>
      </div>
  </div>
  )
}

export default UserSearch