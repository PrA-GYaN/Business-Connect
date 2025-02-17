import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { app, server } from "./socket/socket.js";
import {connectToMongoDB} from "./db/connectToMongoDB.js";
import userRoutes from "./routes/user.route.js";
import meetingRoutes from "./routes/meeting.route.js";
import postRoutes from "./routes/post.route.js";
import threadRoutes from "./routes/threads.route.js";
import commentRoutes from "./routes/comment.route.js";
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import {getAllProfiles} from "./utils/getAllProfile.js";
import {hatespeech} from "./utils/hatespeech.js";

dotenv.config();

console.log(process.env.Frontend_URL);
const corsOptions = {
    origin: process.env.Frontend-URL,  // Your front-end origin
    credentials: true,  // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'OPTIONS'],  // Ensure the correct methods are allowed
    allowedHeaders: ['Content-Type', 'Authorization'],  // Headers you expect
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use('/messages', messageRoutes);
app.use("/meetings", meetingRoutes);
app.use("/threads", threadRoutes);
app.use("/comments", commentRoutes);

server.listen(PORT, () => {
    getAllProfiles();
    hatespeech();
    connectToMongoDB();
    console.log(`Server is running on port ${PORT}`);
});
