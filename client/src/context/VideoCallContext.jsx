import { createContext, useContext, useState, useEffect } from 'react';
import { useChat } from './ChatContext';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import VideoCallRoom from '../components/VideoCallRoom';
import { FaPhoneAlt, FaVideo } from 'react-icons/fa';

const VideoCallContext = createContext();

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const VideoCallProvider = ({ children }) => {
    const { socket, setSocket } = useChat();
    const { id, username } = useSelector((state) => state.user);

    // Video Call State
    const [inCall, setInCall] = useState(false);
    const [callRoomName, setCallRoomName] = useState(null);
    const [showCallInvitation, setShowCallInvitation] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isGroupCall, setIsGroupCall] = useState(false);
    const [callType, setCallType] = useState('video'); // 'video' | 'audio'
    const [activeCallParticipants, setActiveCallParticipants] = useState([]);

    // Initializing Socket if not already present
    useEffect(() => {
        if (!id) return;

        if (!socket) {
            const newSocket = io(ENDPOINT, {
                withCredentials: true,
                transports: ['websocket'],
            });
            newSocket.emit('setup', id);
            setSocket(newSocket);
        }
    }, [id, socket, setSocket]);

    // Socket Event Listeners for Video Calls
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (data) => {
            if (inCall) return;
            setIncomingCall(data);
            setShowCallInvitation(true);
            setIsGroupCall(data.isGroupCall);
            setCallType(data.callType || 'video');
        };

        const handleCallAccepted = (data) => {
            // Optional: toast notification
        };

        const handleCallRejected = (data) => {
            const { rejectedBy } = data;
            toast.error(`${rejectedBy} declined`);

            // If it's a 1:1 call, end the call for the caller
            // We use functional state update or ref to ensure we have latest isGroupCall value if closure is stale
            // But relying on dependency array [isGroupCall] assumes effect re-runs.
            // Since we added isGroupCall to dependency array, this is safe.
            if (!isGroupCall) {
                setInCall(false);
                setCallRoomName(null);
                setActiveCallParticipants([]);
            }
        };

        const handleCallEnded = (data) => {
            setInCall(false);
            setCallRoomName(null);
            setIsGroupCall(false);
            setActiveCallParticipants([]);
            toast.error('Call ended');
        };

        socket.on('video-call-invite', handleIncomingCall);
        socket.on('video-call-accepted', handleCallAccepted);
        socket.on('video-call-rejected', handleCallRejected);
        socket.on('video-call-ended', handleCallEnded);

        return () => {
            socket.off('video-call-invite', handleIncomingCall);
            socket.off('video-call-accepted', handleCallAccepted);
            socket.off('video-call-rejected', handleCallRejected);
            socket.off('video-call-ended', handleCallEnded);
        };
    }, [socket, inCall, isGroupCall]);

    // Functions
    const startCall = (chat, type = 'video') => {
        if (!chat) return;

        let roomName;
        if (chat.isGroupChat) {
            roomName = chat._id;
        } else {
            const otherUser = chat.users.find(user => user._id !== id);
            const userIds = [id, otherUser._id].sort();
            roomName = `${userIds[0]}-${userIds[1]}`;
        }

        const recipientIds = chat.users
            .filter(user => user._id !== id)
            .map(user => user._id);

        setIsGroupCall(chat.isGroupChat);
        setCallRoomName(roomName);
        setInCall(true);
        setActiveCallParticipants(recipientIds);
        setCallType(type);

        socket.emit('video-call-invite', {
            roomName,
            callerName: username,
            callerId: id,
            recipientIds,
            isGroupCall: chat.isGroupChat,
            chatName: chat.isGroupChat ? chat.chatName : username,
            callType: type
        });
    };

    const acceptCall = () => {
        if (!incomingCall) return;

        setCallRoomName(incomingCall.roomName);
        setInCall(true);
        setShowCallInvitation(false);
        setIsGroupCall(incomingCall.isGroupCall);
        setCallType(incomingCall.callType || 'video');

        // Reconstruct participant list: Caller + other recipients (excluding self if strictly needed, but backend handles it)
        // We want to be able to notify everyone if WE end the call (in 1:1, it's just caller).
        const participants = [incomingCall.callerId, ...incomingCall.recipientIds];
        setActiveCallParticipants(participants);

        socket.emit('video-call-accepted', {
            roomName: incomingCall.roomName,
            acceptedBy: username,
            callerId: incomingCall.callerId
        });
        setIncomingCall(null);
    };

    const rejectCall = () => {
        if (!incomingCall) return;

        socket.emit('video-call-rejected', {
            roomName: incomingCall.roomName,
            rejectedBy: username,
            callerId: incomingCall.callerId
        });
        setShowCallInvitation(false);
        setIncomingCall(null);
    };

    const leaveCall = () => {
        // Fix: If it is a 1:1 call, we MUST emit 'video-call-ended' to stop it for the other person.
        // If it is a Group call, we do NOT emit it, so others stay connected.

        if (!isGroupCall) {
            socket.emit('video-call-ended', {
                roomName: callRoomName,
                endedBy: username,
                participantIds: activeCallParticipants
            });
        }

        setInCall(false);
        setCallRoomName(null);
        setIsGroupCall(false);
        setActiveCallParticipants([]);
        toast.success('You left the call');
    };

    return (
        <VideoCallContext.Provider value={{ startCall, inCall }}>
            {children}

            {/* Global Video Call Component */}
            {inCall && callRoomName && (
                <div className="fixed inset-0 z-50 bg-black">
                    <VideoCallRoom
                        roomName={callRoomName}
                        userIdentity={id}
                        userName={username}
                        onLeave={leaveCall}
                        audioOnly={callType === 'audio'}
                    />
                </div>
            )}

            {/* Global Invitation Modal */}
            {showCallInvitation && incomingCall && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-700">
                        <div className="text-center">
                            <div className="mb-6 relative">
                                <div className={`absolute inset-0 ${incomingCall.callType === 'audio' ? 'bg-green-500' : 'bg-blue-500'} blur-xl opacity-20 rounded-full animate-pulse`}></div>
                                {incomingCall.callType === 'audio' ? (
                                    <FaPhoneAlt className="text-6xl text-green-500 mx-auto relative z-10" />
                                ) : (
                                    <FaVideo className="text-6xl text-blue-500 mx-auto relative z-10" />
                                )}
                            </div>

                            <h3 className="text-2xl font-bold mb-2 text-white">
                                {incomingCall.isGroupCall ? 'Group ' : ''}{incomingCall.callType === 'audio' ? 'Audio Call' : 'Video Call'}
                            </h3>
                            <p className="text-gray-400 mb-8 flex flex-col gap-1">
                                <span className="text-lg text-white font-medium">{incomingCall.callerName}</span>
                                <span>is calling you...</span>
                            </p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={acceptCall}
                                    className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                    {incomingCall.callType === 'audio' ? <FaPhoneAlt className="text-sm" /> : <FaVideo className="text-sm" />} Answer
                                </button>
                                <button
                                    onClick={rejectCall}
                                    className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </VideoCallContext.Provider>
    );
};

export const useVideoCall = () => {
    return useContext(VideoCallContext);
};
