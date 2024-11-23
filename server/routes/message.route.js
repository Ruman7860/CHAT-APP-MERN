import express from 'express';
import { verifyUser } from '../util/verifyUser.js';
import { allMessages, deleteMessage, sendMessage } from '../controllers/message.controller.js';
import { uploadSentFile} from '../middleware/multer.middleware.js';

const router = express.Router();

router.get('/:chatId',verifyUser,allMessages);
router.post('/',verifyUser, uploadSentFile.single('file') ,sendMessage);
router.delete('/:messageId',verifyUser,deleteMessage);

export default router;