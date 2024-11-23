import React from 'react'
import { FaTimes } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext';

const UserBadge = ({user,handleDelete}) => {
  return (
    <div className={`bg-blue-900 text-white inline-flex items-center gap-2 mr-3 mt-3 px-3 py-1 rounded-3xl`}>
      <span>{user.username}</span>
      <FaTimes onClick={handleDelete}/>
    </div>
  )
}

export default UserBadge