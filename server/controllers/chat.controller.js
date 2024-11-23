import cloudinary from "../config/cloudinaryConfig.js";
import { errorHandler } from "../error/error.js";
import Chat from "../model/chat.model.js";
import User from "../model/user.model.js";

export const allUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user.id } });
    res.status(200).json({
      success : true,
      data : users
    });

  } catch (error) {
    next(error);
  }
};

export const accessOrCreateChat = async (req, res,next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return next(errorHandler(400,"UserId param not sent with request"));
  }
  try {

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.status(200).json({
        success : true,
        data : isChat[0]
      })
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user.id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json({
        success : true,
        data : FullChat
      });
    } 
  }catch (error) {
    next(error);
  }
};

export const fetchChats = async (req,res,next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).json({
          success : true,
          data : results
        });
      });
  } catch (error) {
    next(error);
  }
}

export const createGroupChat = async (req,res,next) => {
  if (!req.body.users || !req.body.name) {
    return next(errorHandler(400,"Please Fill all the feilds"));
  }
  
  try {
    let groupPhotoURL = '';
    if(req.file?.path){
      const uploadResult = await cloudinary.uploader.upload(req.file.path,{resource_type:'auto'});
      groupPhotoURL = uploadResult.secure_url;
    }
    // from frontend users list are send in array that's why we are parsing.
    var users = JSON.parse(req.body.users);
    console.log("users : ",users);

    if (users.length < 2) {
      return res.status(400).json({
        success : false,
        message : "More than 2 users are required to form a group chat"
      });
    }

    // const loggedInUser = await User.find({_id : req.user.id}).select("-password");
    // users.push(loggedInUser);

    const loggedInUserId = req.user.id;
    users.push(loggedInUserId);

    console.log("New users : ",users)

    // creating new group
    const groupChat = await Chat.create({
      chatName: req.body.name,
      groupPhoto : groupPhotoURL,
      isGroupChat: true,
      users: users,
      groupAdmin: loggedInUserId,
    });

    // finding that newly created group and sending in response.
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      success : true,
      data : fullGroupChat
    });
  } catch (error) {
    next(error);
  }
}

export const renameGroup = async (req,res,next) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!updatedChat) {
      return next(errorHandler(404,"Chat Not Found"));
    } else {
      res.status(200).json({
        success : true,
        data : updatedChat
      });
    }
  } catch (error) {
    next(error);
  }
}

export const removeFromGroup = async (req,res,next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return next(errorHandler(404,"Chat Not Found"));
  } else {
    res.status(200).json({
      success : true,
      data : removed
    });
  }
}

export const addToGroup = async (req,res,next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return next(errorHandler(404,"Chat Not Found"));
  } else {
    res.status(200).json({
      success : true,
      data : added
    });
  }
}