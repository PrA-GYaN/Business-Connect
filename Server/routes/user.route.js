import express from "express";
import multer from 'multer';
import protectedRoute from '../middleware/protectedRoute.js';
import {getUsersForSidebar} from '../controllers/onlineuser.controller.js'
import {login, logout,sendOTP, getNotification,getProfileById, signup, sendNotification} from "../controllers/user.controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/signup", signup);
router.post("/getonline", protectedRoute,getUsersForSidebar);
router.post("/login", login);
router.get("/notification/:userId",getNotification);
router.post("/notify",sendNotification);
router.post("/send-otp",sendOTP);
router.get("/getprofilebyid/:id", getProfileById);

router.post("/logout", logout);

export default router;