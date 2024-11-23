import React from 'react';
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

const ProtectRoute = ({children}) => {
    const {username} = useSelector((state) => state.user);

    if(!username){
        return <Navigate to='/login'/>
    }

    return children;
}

export default ProtectRoute;

