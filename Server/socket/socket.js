import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:5173"],
		methods: ["GET", "POST"],
	},
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId] || null;
};

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;

	if (userId && userId !== "undefined") {
		userSocketMap[userId] = socket.id;
	}

	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		const disconnectedUserId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
		if (disconnectedUserId) {
			delete userSocketMap[disconnectedUserId];
		}
	});
});

io.on("error", (error) => {
	console.error("Socket error:", error);
});

export { app, io, server };
