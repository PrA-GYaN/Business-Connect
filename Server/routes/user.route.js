import express from "express";
import multer from 'multer';
import protectedRoute from '../middleware/protectedRoute.js';
import { getNotifications,sendNotification } from "../controllers/notification.controller.js";
import {login,updateUserSelection,Liked_Dislike,getAllUser,sendOTP,getProfileById, signup, updateUserProfileField} from "../controllers/user.controller.js";
import { runRecommend } from "../utils/runRecommend.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/signup",upload.single('image'), signup);
router.post("/update-user-selection",updateUserSelection);
router.post("/login", login);
router.post("/updateUser",protectedRoute,updateUserProfileField);
router.post("/getrecommened",protectedRoute,runRecommend);
router.get("/getallusers",protectedRoute,getAllUser);
router.post("/swipe",protectedRoute,Liked_Dislike);
router.get("/getprofilebyid/:id", getProfileById);
router.get("/notification",protectedRoute,getNotifications);
router.post("/notify",sendNotification);
router.post("/send-otp",sendOTP);

export default router;