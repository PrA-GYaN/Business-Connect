import express from "express";
import { createThread,getAllThreads,getThreadByProfile,getThreadById,deleteThread,updateThread,upvoteThread,downvoteThread} from "../controllers/threads.controller.js";import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/create", protectedRoute, createThread);
router.get("/getall", getAllThreads);
router.post("/delete", protectedRoute, deleteThread);
router.post("/update", protectedRoute, updateThread);
router.get("/getbyid/:id", getThreadById);
router.get("/getthreadbyprofile/:id", getThreadByProfile);
router.post("/upvote/:id", protectedRoute,upvoteThread);
router.post("/downvote/:id",protectedRoute, downvoteThread);

export default router;