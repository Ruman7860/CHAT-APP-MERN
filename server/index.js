import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.route.js';
import chatRouter from './routes/chat.route.js';
import messageRouter from './routes/message.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const frontendURL = 'http://localhost:5173';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: frontendURL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

// Database Connection
mongoose.connect(process.env.CONN_STR)
.then(() => {
    console.log("Mongodb connected succesfully");
})
.catch((err) => {
    console.error("MongoDB connection error", err);
});

app.get('/',(req,res)=>{
    res.send("Heloo from Server");
});

// Import Routes
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);

// Global Error Handler
app.use((err,req,res,next) => {
    console.error(err);
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Issue";

    res.status(statusCode).json({
        sucess : false,
        message
    })
});

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Set up Socket.io server
const io = new Server(server, {
    pingTimeout:60000,
    cors: {
        origin: frontendURL, // Frontend URL
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
});

// WebSocket events
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // frontend will send some data and will join our room
    socket.on('setup',(loggedInUserId) => {
        // creating a new room with id of userData and that room will be exclusive to that particular user only
        socket.join(loggedInUserId);
        console.log(loggedInUserId);
        socket.emit("connected");
    });

    // loggedIn User kis chat or room ko join kr rha hai.
    socket.on('join-chat',(room) => {
        socket.join(room);
        console.log("User joined Room "+room);
    });

    socket.on('typing',(room) => socket.in(room).emit('typing'));
    socket.on('stop-typing',(room) => socket.in(room).emit('stop-typing'));

    socket.on('new-message',(newMessageRecieved) => {
        const chat = newMessageRecieved.chat;
        if(!chat.users){
            console.log("chat.users not defined");
            return;
        }
        chat.users.forEach(user => {
            if(user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message-recieved",newMessageRecieved);
        })
    })
});

// Start the server
const port = process.env.PORT;
server.listen(port,() => {
    console.log(`Server is running on port ${port}`);
})
