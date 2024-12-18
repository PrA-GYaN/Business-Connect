import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
// import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST'],
  credentials: true,  // Allow credentials (cookies, etc.)
}));
app.use(cookieParser());
//SSL Certificate for HTTPS connection
// const privateKey = fs.readFileSync('./Certificates/192.168.254.14-key.pem', 'utf8');
// const certificate = fs.readFileSync('./Certificates/192.168.254.14.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

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

  socket.on('offer', (offer, to) => {
    console.log('Offer received');
    // to = getReceiverSocketId(to); // Get the socket ID of the target user
    socket.to(to).emit('offer', offer, socket.id); // Send offer to the target user
  });

  // Handle incoming answer
  socket.on('answer', (answer, to) => {
    console.log('Answer received');
    // to = getReceiverSocketId(to); 
    socket.to(to).emit('answer', answer); // Send answer to the target user
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (candidate, to) => {
    // to = getReceiverSocketId(to); 
    console.log('ICE candidate received by:', to);
    socket.to(to).emit('ice-candidate', candidate); // Send candidate to the target user
  });

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