import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST'],
  credentials: true,  // Allow credentials (cookies, etc.)
}));
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const userSocketMap = {}; // Map to store userId to socketId

// Get the socket ID of the receiver user
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId] || null;
};

io.on("connection", (socket) => {

  socket.on('offer', (offer) => {
    console.log('Offer received');
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  // Send the current socket id to the client
  socket.emit("me", socket.id);

  // Register the user by userId (sent from the client)
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  }

  // Emit online users after each connection
  io.emit("getOnlineUsers", userSocketMap);
  console.log("Online users:", userSocketMap);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      console.log(`User ${disconnectedUserId} disconnected`);
      io.emit("getOnlineUsers", userSocketMap); // Update online users for all clients
    }

    // Inform all users that a call has ended
    socket.broadcast.emit("callEnded");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

io.on("error", (error) => {
  console.error("Socket.IO server error:", error);
});

// Export the app and server for integration with other modules (e.g., for testing or external API)
export { app, io, server };