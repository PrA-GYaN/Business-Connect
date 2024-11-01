import express from "express";
import multer from 'multer';
import protectedRoute from '../middleware/protectedRoute.js';
import {login,updateUserSelection,Liked_Dislike,getAllUser,sendOTP, getNotification,getProfileById, signup, sendNotification} from "../controllers/user.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/signup",upload.single('image'), signup);
router.post("/update-user-selection",updateUserSelection);
router.post("/login", login);
router.get("/getallusers",protectedRoute,getAllUser);
router.post("/swipe",protectedRoute,Liked_Dislike);
router.get("/getprofilebyid/:id", getProfileById);
router.get("/notification/:userId",getNotification);
router.post("/notify",sendNotification);
router.post("/send-otp",sendOTP);

export default router;