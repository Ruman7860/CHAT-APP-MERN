import React, {useState} from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {Provider} from 'react-redux'
import ChatInterface from './pages/ChatInterface';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './redux/userStore';
import ProtectRoute from './utils/ProtectRoute';
import { ChatContextProvider } from './context/ChatContext';

const App = () => {

  return (
    <Provider store={store}>
      <ChatContextProvider>
        <ThemeProvider>
          <BrowserRouter future={{
              v7_startTransition: true, // Enabling React.startTransition behavior for state updates
              v7_relativeSplatPath: true // Enabling the new behavior for relative splat path resolution
            }}>
            <Routes>
              <Route path='/' element={<ProtectRoute><ChatInterface/></ProtectRoute>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/signup' element={<Signup/>}/>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ChatContextProvider>
    </Provider>
  );
}

export default App