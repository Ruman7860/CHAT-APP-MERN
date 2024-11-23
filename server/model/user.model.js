import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default : "" }, // URL for Cloudinary image
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
},{ timestaps: true });

const User = mongoose.model("User",userSchema);

export default User;