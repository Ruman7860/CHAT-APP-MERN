import bcrypt from 'bcryptjs';
import { errorHandler } from "../error/error.js";
import User from "../model/user.model.js";
import cloudinary from '../config/cloudinaryConfig.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const profilePicPath = req.file?.path;

  try {
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, 'User already exists'));
    }

    // If the user does not exist, proceed with registration
    if (!username || !email || !password) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const hashPassword = bcrypt.hashSync(password, 12);

    let profilePicUrl = '';
    if (profilePicPath) {
      // Upload the profile picture to cloud storage
      const uploadResult = await cloudinary.uploader.upload(profilePicPath, { resource_type: 'auto' });
      profilePicUrl = uploadResult.secure_url;
    }

    const newUser = new User({
      username,
      email,
      password: hashPassword,
      profilePic: profilePicUrl,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req,res,next) => {
  const {email,password} = req.body;
  try {
    const user = await User.findOne({email});
    if(!user){
      return next(errorHandler(401,"User not found! Please signup first"));
    }

    const isvalidPassword = bcrypt.compare(password,user.password);

    if(!isvalidPassword){
      return next(errorHandler(401,"Password Incorrect"));
    }

    const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn: "30d"});

    // res.cookie('access_token',token,{
    //   httpOnly:true,
    // }).status(200).json({
    //   success : true,
    //   message : "Login Successfull",
    //   user : user
    // })

    res.cookie('access_token', token, {
      httpOnly: true,      // This ensures that the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',  // Set this to true in production (HTTPS)
      sameSite: 'None',    // Allow cross-site cookie usage (set to 'Strict' or 'Lax' if you don't need cross-site)
    }).status(200).json({
      success: true,
      message: "Login successful",
      user: user
    });

  } catch (error) {
    next(error);
  }
}

export const logout = async (req,res,next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({
      success : true,
      message : "Logged out successfully"
    })
  } catch (error) {
    next(error);
  }
}

export const updateProfile = async (req,res,next) => {
  console.log("req.body :-",req.body);
  console.log("req.file :-",req.file);

  const {username,email} = req.body;

  const {id} = req.user;

  if(!id){
    return next(errorHandler(401,"Unauthorized"));
  }

  try {
    const loggedInUser = await User.findOne({_id : id});
    if(username){
      loggedInUser.username = username;
    }

    if(email){
      loggedInUser.email = email;
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
      loggedInUser.profilePic = uploadResult.secure_url;
    }

    const updatedUser = await loggedInUser.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
    
  } catch (error) {
    next(error);
  }
}
