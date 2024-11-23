import multer from "multer";
import crypto from "crypto";
import path from "path";

// storage for auth uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images/uploads");
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12,(err,bytes) => {
        const fn = bytes.toString('hex') + path.extname(file.originalname)
        cb(null,fn);
      })
    }
});

// Multer storage configuration
const sendFilestorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./public/images/send-recieve-images"); // Images folder
    } else {
      cb(null, "./public/files/send-recieve-files"); // Files folder
    }
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, buffer) => {
      if (err) return cb(err);
      const uniqueName = buffer.toString("hex") + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});

// Middleware for file uploads
export const uploadSentFile = multer({
  storage: sendFilestorage, // Corrected to use sendFilestorage
  fileFilter: (req, file, cb) => {
    // Allow all file types except executable files for security
    if (
      file.mimetype !== "application/x-msdownload" && 
      file.mimetype !== "application/x-msdos-program" && 
      file.mimetype !== "application/x-msinstaller"
    ) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Executable files are not allowed")); // Reject executables
    }
  },
});
  
// Middleware for image uploads for auth
export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
  },
})