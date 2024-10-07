import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { app, server } from "./socket/socket.js";
import connectToMongoDB from "./db/connectToMongoDB.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from 'cookie-parser';

dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/users", userRoutes);

server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server is running on port ${PORT}`);
});
