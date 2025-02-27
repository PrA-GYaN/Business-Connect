import express from "express";
import { createThread,getAllThreads,getThreadByProfile,deleteThreads,getThreadById,deleteThread,updateThread,upvoteThread,downvoteThread} from "../controllers/threads.controller.js";import protectedRoute from "../middleware/protectedRoute.js";
import multer from "multer";
import {hatecheck} from "../utils/hate_detect.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/create", upload.single('image'), createThread);
router.get("/getall", getAllThreads);
router.post("/delete", protectedRoute, deleteThread);
router.post("/deletethreads", deleteThreads);
router.post("/update", protectedRoute, updateThread);
router.get("/getthreadbyid/:id", getThreadById);
router.get("/getthreadbyprofile/:id", getThreadByProfile);
router.post("/upvote/:id", protectedRoute,upvoteThread);
router.post("/downvote/:id",protectedRoute, downvoteThread);
router.post("/hatecheck", hatecheck);

export default router;