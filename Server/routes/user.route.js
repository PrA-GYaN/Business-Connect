import express from "express";
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import mongoose from "mongoose";
import { imageUpload, login, logout, getNotification, signup, sendNotification } from "../controllers/user.controller.js";
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';
import { connectToMongoDB } from "../db/connectToMongoDB.js";
import gridfsStream from 'gridfs-stream';

let gfs;
dotenv.config();

const setupGridFS = (connection) => {
    const dbConnection = connection.connection.db;
    gfs = gridfsStream(dbConnection, mongoose.mongo);
    gfs.collection('uploads');
};

const init = async () => {
    const dbConnection = await connectToMongoDB();
    setupGridFS(dbConnection);
};
init();

//Storage Engine
var storage = new GridFsStorage({
    url: process.env.MONGO_DB_URI,
    file: (req, file) => {
        console.log(req.file);
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
const upload = multer({ storage });
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/upload", upload.single('image'), imageUpload);
router.get("/notification/:userId",getNotification);
router.post("/notify",sendNotification);

router.post("/logout", logout);

export default router;