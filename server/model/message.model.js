import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    image: { type: String }, // URL or path to the image
    file: { type: String },  // URL or path to the file
    fileName: { type: String }, // Original name of the file
    fileType: { type: String }, // (optional) File type for files
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
