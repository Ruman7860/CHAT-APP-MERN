import { createContext, useContext, useState } from "react";

export const ChatContext = createContext();

export const ChatContextProvider = ({children}) => {
    const [selectedChat,setSelectedChat] = useState();
    const [chats,setChats] = useState([]);
    const [notifications,setNotifications] = useState([]);

    return <ChatContext.Provider 
        value={{
            selectedChat,
            setSelectedChat,
            chats,
            setChats,
            notifications,
            setNotifications
        }}
    >
        {children}
    </ChatContext.Provider>
}

export const useChat = () => {
    return useContext(ChatContext);
}

