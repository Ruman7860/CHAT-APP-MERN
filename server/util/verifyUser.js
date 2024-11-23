import { errorHandler } from "../error/error.js";
import User from "../model/user.model.js";
import jwt from 'jsonwebtoken';

export const verifyUser = async (req,res,next) => {
    const access_token = req.cookies.access_token;
    console.log(access_token);

    if(!access_token){
        return next(errorHandler(401,"UnAuthorized"));
    }

    jwt.verify(access_token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return next(errorHandler(401,"UnAuthorized"));
        }

        req.user = user;
        next();
    })
}