import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.route.js';
import chatRouter from './routes/chat.route.js';
import messageRouter from './routes/message.route.js';
import livekitRouter from './routes/livekit.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';


// Load environment variables
dotenv.config();
const frontendURL = process.env.frontendURL || 'http://localhost:5173';

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

app.get('/', (req, res) => {
    res.send("Heloo from Server");
});

// Import Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/livekit', livekitRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Issue";

    res.status(statusCode).json({
        sucess: false,
        message
    })
});

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Set up Socket.io server
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: frontendURL, // Frontend URL
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
});

// WebSocket events
io.on('connection', (socket) => {
    // frontend will send some data and will join our room
    socket.on('setup', (loggedInUserId) => {
        socket.join(loggedInUserId)
        socket.emit("connected");
    });

    // loggedIn User kis chat or room ko join kr rha hai.
    socket.on('join-chat', (room) => {
        socket.join(room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing'));

    socket.on('new-message', (newMessageRecieved) => {
        const chat = newMessageRecieved.chat;
        if (!chat.users) {
            return;
        }
        chat.users.forEach(user => {
            if (user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message-recieved", newMessageRecieved);
        })
    });

    // Video call invitation events
    socket.on('video-call-invite', (data) => {
        // data: { roomName, callerName, callerId, recipientIds, isGroupCall }
        const { recipientIds } = data;
        console.log("Broadcasting video invite to:", recipientIds);

        // Emit invitation to all recipients
        recipientIds.forEach(recipientId => {
            // Use io.to() to ensure delivery to the specific user room
            io.to(recipientId).emit('video-call-invite', data);
        });
    });

    socket.on('video-call-accepted', (data) => {
        // data: { roomName, acceptedBy, callerId }
        const { callerId } = data;

        // Notify the caller that someone accepted
        io.to(callerId).emit('video-call-accepted', data);
    });

    socket.on('video-call-rejected', (data) => {
        // data: { roomName, rejectedBy, callerId }
        const { callerId } = data;

        // Notify the caller that someone rejected
        io.to(callerId).emit('video-call-rejected', data);
    });

    socket.on('video-call-ended', (data) => {
        // data: { roomName, endedBy, participantIds }
        const { participantIds } = data;

        // Notify all participants that the call ended
        participantIds.forEach(participantId => {
            io.to(participantId).emit('video-call-ended', data);
        });
    });
});

// Start the server
const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
