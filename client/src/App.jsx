import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import ChatInterface from './pages/ChatInterface';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './redux/userStore';
import ProtectRoute from './utils/ProtectRoute';
import { ChatContextProvider } from './context/ChatContext';
import { VideoCallProvider } from './context/VideoCallContext';

const App = () => {

  return (
    <Provider store={store}>
      <ChatContextProvider>
        <VideoCallProvider>
          <ThemeProvider>
            <BrowserRouter future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}>
              <Routes>
                <Route path='/' element={<ProtectRoute><ChatInterface /></ProtectRoute>} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </VideoCallProvider>
      </ChatContextProvider>
    </Provider>
  );
}

export default App