import express from "express";
import {createComment,deleteComment,updateComment,getCommentsByThreadId,upvoteComment,downvoteComment} from '../controllers/comment.controller.js';
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/create", createComment);
router.post("/delete", protectedRoute, deleteComment);
router.post("/update", protectedRoute, updateComment);
router.get("/getbyid/:threadId", getCommentsByThreadId);
router.post("/upvote/:id", protectedRoute,upvoteComment);
router.post("/downvote/:id",protectedRoute, downvoteComment);

export default router;