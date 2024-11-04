import Notification from '../models/notification.model.js';
import { getReceiverSocketId, io } from "../socket/socket.js";

export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return `${seconds} seconds ago`;
};

export const getNotifications = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ message: 'Invalid user ID provided.' });
    }

    try {
        const userNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        const formattedNotifications = userNotifications.map(notification => ({
            ...notification._doc,
            createdAt: timeAgo(notification.createdAt)
        }));

        return res.status(200).json(formattedNotifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const sendNotification = async (message,receiverId) => {
    const userId = receiverId;
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver Socket ID:",receiverSocketId);
    try {
        const newNotification = new Notification({
            userId,
            message
        });
        await newNotification.save();
        if (receiverSocketId) {
            // io.to(<socket_id>).emit() used to send events to specific client
            io.to(receiverSocketId).emit("newNotification", newNotification);
            console.log("Sent Notification to:",receiverSocketId);
        }
        console.log(`Notification sent to user ${userId}: ${message}`);
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

