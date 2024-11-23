import cloudinary from "../config/cloudinaryConfig.js";
import { errorHandler } from "../error/error.js";
import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";
import User from "../model/user.model.js";

export const allMessages = async (req,res,next) => {
    const {chatId} = req.params;
    if(!chatId){
        return next(errorHandler(404,"Chat not found"));
    }
    try {
        const messages = await Message.find({ chat: chatId })
          .populate("sender", "username profilePic email")
          .populate("chat");
        
        res.status(200).json({
            success : true,
            data: messages
        })
    } catch (error) {
        next(error);
    }
}

export const sendMessage = async (req,res,next) => {
    console.log("body :->",req.body);
    console.log("file :->",req.file);
    const { content, chatId } = req.body;
    const {id} = req.user;

    if(!id){
        return next(errorHandler(401,"UnAuthorized"));
    }

    if (!chatId) {
        return next(errorHandler(400,"Invalid data passed into request"));
    }

    let imageURL = '';
    let fileURL = '';
    let fileType = '';
    if(req.file){
        try {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
            const isImage = req.file.mimetype.startsWith('image/');
            if (isImage) {
                imageURL = uploadResult.secure_url;
            } else {
                fileURL = uploadResult.secure_url;
                fileType = req.file.mimetype;
            }
        } catch (uploadError) {
            return next(errorHandler(500, "Image upload failed"));
        }
    }

    
    try {
        var newMessage = {
            sender: id,
            content: content,
            chat: chatId,
            image: imageURL || undefined,
            file: fileURL || undefined,
            fileType: fileType || undefined,
        };
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "username profilePic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "username profilePic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.status(200).json({
            success : true,
            data : message
        });
    } catch (error) {
        next(error);
    }
}

export const deleteMessage = async (req, res, next) => {
    const { messageId } = req.params;

    if (!messageId) {
        return next(errorHandler(400, "Message ID is required"));
    }

    try {
        // Find the message to delete
        const message = await Message.findById(messageId);

        if (!message) {
            return next(errorHandler(404, "Message not found"));
        }

        // Check if the logged-in user is the sender of the message
        if (message.sender.toString() !== req.user.id) {
            return next(errorHandler(403, "You can only delete your own messages"));
        }

        // Delete the message from the database
        await Message.findByIdAndDelete(messageId);

        // Update the latestMessage field in the associated chat
        const chat = await Chat.findById(message.chat);

        // Check if the deleted message was the latestMessage
        if (chat.latestMessage.toString() === messageId) {
            // Find the new latest message (if any)
            const newLatestMessage = await Message.find({ chat: message.chat }).sort({ createdAt: -1 }).limit(1);

            if (newLatestMessage.length > 0) {
                // Update the chat with the new latest message
                chat.latestMessage = newLatestMessage[0]._id;
                await chat.save();
            } else {
                // If there are no more messages, set latestMessage to null
                chat.latestMessage = null;
                await chat.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const changeGroupPhoto = async (req, res, next) => {
    const { chatId } = req.body;
  
    if (!req.file?.path) {
      return next(errorHandler(400, "Group photo file is required"));
    }
  
    try {
      // Upload the new group photo to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, { resource_type: 'auto' });
      const groupPhotoURL = uploadResult.secure_url;
  
      // Update the group photo in the database
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          groupPhoto: groupPhotoURL,
        },
        { new: true } // Return the updated document
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      if (!updatedChat) {
        return next(errorHandler(404, "Chat Not Found"));
      }
  
      res.status(200).json({
        success: true,
        data: updatedChat,
      });
    } catch (error) {
      next(error);
    }
  };
  