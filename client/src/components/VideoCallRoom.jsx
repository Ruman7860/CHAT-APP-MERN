import React, { useState, useEffect } from 'react';
import {
    LiveKitRoom,
    useParticipants,
    VideoTrack,
    AudioTrack,
    useLocalParticipant,
    ControlBar,
    RoomAudioRenderer
} from '@livekit/components-react';
import '@livekit/components-styles';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { FaPhoneSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { Track } from 'livekit-client';

/**
 * Custom Participant Video Component
 */
const ParticipantVideo = ({ participant, isLocal = false }) => {
    const videoTrack = participant.videoTrackPublications.values().next().value?.track;
    const audioTrack = participant.audioTrackPublications.values().next().value?.track;

    return (
        <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
            {/* Video */}
            {videoTrack ? (
                <VideoTrack
                    trackRef={{
                        participant: participant,
                        publication: participant.videoTrackPublications.values().next().value,
                        source: Track.Source.Camera
                    }}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-3xl text-white font-bold">
                                {(
                                    participant?.name ||
                                    participant?.identity ||
                                    'U'
                                ).charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm">Camera off</p>
                    </div>
                </div>
            )}

            {/* Audio (hidden, just for playback) */}
            {audioTrack && !isLocal && (
                <AudioTrack
                    trackRef={{
                        participant: participant,
                        publication: participant.audioTrackPublications.values().next().value,
                        source: Track.Source.Microphone
                    }}
                />
            )}

            {/* Name label */}
            <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full ${isLocal ? 'bg-blue-600' : 'bg-black/70'
                }`}>
                <span className="text-white text-sm font-medium">
                    {isLocal ? 'You' : (participant.name || participant.identity)}
                </span>
            </div>

            {/* Mic status indicator */}
            <div className="absolute top-3 right-3">
                {participant.isMicrophoneEnabled ? (
                    <div className="bg-green-600 p-2 rounded-full">
                        <FaMicrophone className="text-white text-xs" />
                    </div>
                ) : (
                    <div className="bg-red-600 p-2 rounded-full">
                        <FaMicrophoneSlash className="text-white text-xs" />
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Custom Video Stage Component
 */
const VideoStage = ({ currentUserIdentity, onLeave, audioOnly }) => {
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    // Separate remote participants
    const remoteParticipants = participants.filter(p => p.identity !== currentUserIdentity);

    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            {/* Main video area */}
            <div className="flex-1 relative p-4 min-h-0">
                {remoteParticipants.length > 0 ? (
                    // Show remote participants in grid
                    <div className={`h-full grid gap-4 ${remoteParticipants.length === 1 ? 'grid-cols-1' :
                        remoteParticipants.length === 2 ? 'grid-cols-2' :
                            remoteParticipants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
                                'grid-cols-3'
                        }`}>
                        {remoteParticipants.map((participant) => (
                            <ParticipantVideo
                                key={participant.identity}
                                participant={participant}
                                isLocal={false}
                            />
                        ))}
                    </div>
                ) : (
                    // Waiting for others to join
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4">
                                <ClipLoader color="#3b82f6" size={40} />
                            </div>
                            <p className="text-gray-400 text-lg">Waiting for others to join...</p>
                        </div>
                    </div>
                )}

                {/* Your video (picture-in-picture style) */}
                {localParticipant && (
                    <div className="absolute bottom-24 right-6 w-64 h-48 shadow-2xl border-2 border-blue-500 rounded-lg overflow-hidden">
                        <ParticipantVideo
                            participant={localParticipant}
                            isLocal={true}
                        />
                    </div>
                )}
            </div>

            {/* Control bar at bottom */}
            <div className="bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Room info */}
                        <div className="text-white min-w-[100px]">
                            <p className="text-sm text-gray-400">
                                {participants.length} participant{participants.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <ControlBar
                                variation="minimal"
                                controls={{
                                    microphone: true,
                                    camera: !audioOnly,
                                    screenShare: !audioOnly,
                                    chat: false,
                                    leave: false
                                }}
                            />

                            {/* Custom leave button */}
                            <button
                                onClick={onLeave}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
                                title="Leave call"
                            >
                                <FaPhoneSlash />
                                Leave
                            </button>
                        </div>

                        {/* Placeholder for balance */}
                        <div className="min-w-[100px]"></div>
                    </div>
                </div>
            </div>

            {/* Audio renderer for all remote participants */}
            <RoomAudioRenderer />
        </div>
    );
};

/**
 * VideoCallRoom Component
 * 
 * Reusable component for 1:1 and group video/audio calls using LiveKit
 */
const VideoCallRoom = ({ roomName, userIdentity, userName, onLeave, audioOnly }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://chat-app-i7uuljgv.livekit.cloud';
    const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchToken = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.post(
                    `${backendURL}/api/livekit/token`,
                    {
                        roomName,
                        userIdentity
                    },
                    {
                        withCredentials: true
                    }
                );

                if (response.data.success && response.data.token) {
                    setToken(response.data.token);
                } else {
                    throw new Error('Failed to get access token');
                }
            } catch (err) {
                console.error('Error fetching LiveKit token:', err);
                setError(err.response?.data?.message || 'Failed to join video call');
            } finally {
                setLoading(false);
            }
        };

        if (roomName && userIdentity) {
            fetchToken();
        }

        return () => {
            setToken(null);
        };
    }, [roomName, userIdentity]);

    const handleDisconnect = () => {
        setToken(null);
        if (onLeave) {
            onLeave();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center">
                    <ClipLoader color="#3b82f6" size={50} />
                    <p className="mt-4 text-white text-lg">Joining call...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center max-w-md p-6 bg-red-900/20 border border-red-500 rounded-lg">
                    <h3 className="text-red-400 text-xl font-semibold mb-2">Connection Error</h3>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={handleDisconnect}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!token) {
        return null;
    }

    return (
        <div className="h-full w-full bg-gray-900">
            <LiveKitRoom
                serverUrl={serverUrl}
                token={token}
                connect={true}
                audio={true}
                video={!audioOnly}
                onDisconnected={handleDisconnect}
                className="h-full"
            >
                <VideoStage
                    currentUserIdentity={userIdentity}
                    onLeave={handleDisconnect}
                    audioOnly={audioOnly}
                />
            </LiveKitRoom>
        </div>
    );
};

export default VideoCallRoom;
