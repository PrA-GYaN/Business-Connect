import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from 'cors';

const app = express();

// CORS configuration for Express
app.use(cors({
  origin: 'http://localhost:5173',  // Front-end URL
  methods: ['GET', 'POST'],
  credentials: true,  // Allow credentials (cookies, etc.)
}));

const server = http.createServer(app);

// Socket.IO setup with CORS for the socket server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  // Same front-end URL
    methods: ['GET', 'POST'],
    credentials: true,  // Allow credentials (cookies, etc.)
  },
});

const userSocketMap = {};  // Stores userId -> socketId mappings

// Function to get the receiver socketId based on userId
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId] || null;
};

// Listen for incoming socket connections
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // Extract userId from the handshake query
  const userId = socket.handshake.query.userId;

  // Map the userId to the socketId if valid
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  }

  // Handle user disconnections
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);

    // Find and remove the user from the map by their socketId
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      console.log(`User ${disconnectedUserId} disconnected`);
    }
  });

  // Additional error handling for socket connections
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Handle global socket errors
io.on("error", (error) => {
  console.error("Socket.IO server error:", error);
});

export { app, io, server };
