import express from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// LiveKit configuration from environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

/**
 * POST /api/livekit/token
 * Generate a LiveKit access token for a user to join a video call room
 * 
 * Request body:
 * - roomName: string (UUID for 1:1 calls, group chat ID for group calls)
 * - userIdentity: string (unique user ID, e.g., MongoDB _id)
 * 
 * Response:
 * - token: string (JWT token for LiveKit room access)
 */
router.post('/token', async (req, res) => {
    try {
        const { roomName, userIdentity } = req.body;

        // Validate required fields
        if (!roomName || !userIdentity) {
            return res.status(400).json({
                success: false,
                message: 'roomName and userIdentity are required'
            });
        }

        // Validate LiveKit configuration
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
            console.error('LiveKit credentials not configured');
            return res.status(500).json({
                success: false,
                message: 'LiveKit service not configured'
            });
        }

        // Create access token
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: userIdentity,
            ttl: '1h', // Token valid for 1 hour
        });

        console.log("LiveKit token generated successfully");

        // Grant permissions for the room
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,      // Allow publishing audio/video
            canSubscribe: true,    // Allow subscribing to other participants
            canPublishData: true,  // Allow publishing data messages
        });

        // Generate JWT token (async in recent versions)
        const token = await at.toJwt();

        // Return token to client
        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate access token',
            error: error.message
        });
    }
});

/**
 * GET /api/livekit/rooms
 * List all active LiveKit rooms (for debugging purposes)
 * 
 * Response:
 * - rooms: array of room objects with name and participant count
 */
router.get('/rooms', async (req, res) => {
    try {
        // Validate LiveKit configuration
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
            return res.status(500).json({
                success: false,
                message: 'LiveKit service not configured'
            });
        }

        // Create RoomServiceClient
        const roomService = new RoomServiceClient(
            LIVEKIT_URL,
            LIVEKIT_API_KEY,
            LIVEKIT_API_SECRET
        );

        // List all active rooms
        const rooms = await roomService.listRooms();

        // Format response
        const roomsData = rooms.map(room => ({
            name: room.name,
            sid: room.sid,
            numParticipants: room.numParticipants,
            creationTime: room.creationTime,
            emptyTimeout: room.emptyTimeout,
            maxParticipants: room.maxParticipants
        }));

        res.status(200).json({
            success: true,
            count: roomsData.length,
            rooms: roomsData
        });

    } catch (error) {
        console.error('Error fetching LiveKit rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms',
            error: error.message
        });
    }
});

export default router;
