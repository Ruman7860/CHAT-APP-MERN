# Chat Application with MERN Stack and Socket.IO

This is a **real-time chat application** built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time communication. It allows users to send and receive messages instantly and is deployed on a cloud platform.

## Features

- **Real-time Messaging**: Users can send and receive messages instantly with the help of Socket.IO.
- **User Authentication**: Register and login to access personalized chat.
- **Message Notifications**: Real-time notifications when a new message is received.
- **Image/File Sharing**: Send images in messages.
- **Responsive Design**: Works well on both mobile and desktop.
- **Typing Indicators**: Shows when someone is typing.

## Technologies Used

- **Frontend**:
  - React
  - Redux (for state management)
  - Axios (for making HTTP requests)
  - React Router (for navigation)
  - Socket.IO-client (for real-time communication)

- **Backend**:
  - Node.js
  - Express.js
  - Socket.IO (for real-time communication)
  - MongoDB (for storing user data and chat messages)
  - JWT (for user authentication)

- **Deployment**:
  - Deployed on Render (Backend)
  - Deployed on Render (Frontend)

## Live Demo

Try the live version of the application:
- **Frontend**: [Live Frontend](https://chat-app-mern-frontend-yn0w.onrender.com)
- **Backend**: [Live Backend](https://chat-app-mern-backend-0e7i.onrender.com)

## Installation

### Clone the repository
```bash
git clone https://github.com/Ruman7860/CHAT-APP-MERN.git
```

### Backend Setup

### 1. After cloning the repository, navigate to the `server` directory where the backend files are located:
```bash
cd server
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create a `.env` file and configure the environment variables:
```bash
MONGO_URI=your-mongodb-connection-uri
JWT_SECRET=your-jwt-secret
PORT=3000
CLOUDINARY_CLOUD_NAME=your CLOUDINARY cloud name
CLOUDINARY_API_KEY=your CLOUDINARY API key
CLOUDINARY_API_SECRET=your CLOUDINARY API SCERET
```

### 4. Start the backend server:
```bash
npm start
```

### Frontend Setup


### 1. Navigate to the frontend folder:
```bash
cd client
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Start the frontend server:
```bash
npm run dev
```




