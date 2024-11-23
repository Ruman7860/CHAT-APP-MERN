import express from 'express';
import { login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyUser } from '../util/verifyUser.js';

const router = express.Router();

router.post('/signup',upload.single('profilePic'),signup);
router.post('/login',login);
router.post('/logout',verifyUser,logout);
router.put('/update-profile',verifyUser,upload.single('profilePic'),updateProfile);

export default router;