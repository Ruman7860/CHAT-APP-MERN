import express from 'express';
import { verifyUser } from '../util/verifyUser.js';
import { accessOrCreateChat, addToGroup, allUsers, createGroupChat, fetchChats, removeFromGroup, renameGroup } from '../controllers/chat.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { changeGroupPhoto } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/search",verifyUser,allUsers);
router.post("/",verifyUser,accessOrCreateChat);
router.get("/",verifyUser,fetchChats);
router.post("/group",verifyUser,upload.single('groupPhoto'),createGroupChat);
router.put("/rename-group",verifyUser,renameGroup);
router.put("/group-add",verifyUser,addToGroup);
router.put("/group-remove",verifyUser,removeFromGroup);
router.put("/change-group-photo", verifyUser, upload.single('groupPhoto'), changeGroupPhoto);

  

export default router;