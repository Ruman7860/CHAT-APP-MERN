import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import SingleChat from './chatWindowComponents/SingleChat';

const ChatWindow = ({fetchAgain,setFetchAgain}) => {
  const {isDarkMode} = useTheme();
  const {selectedChat} = useChat();

  return (
    <div className={`w-full md:w-2/3 lg:w-3/4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-teal-50 text-black'}
    ${!selectedChat && 'hidden md:block'}
    `}>
      <SingleChat fetchAgain = {fetchAgain} setFetchAgain = {setFetchAgain} />
    </div>
  );
};

export default ChatWindow;