import express from "express";
import { getMessages, sendMessage,deleteConversation } from "../controllers/message.controller.js";
import protectedRoute from "../middleware/protectedRoute.js";
import { getUsersForSidebar,getLastMessage } from "../controllers/onlineuser.controller.js";

const router = express.Router();

router.get('/getusersforsidebar', protectedRoute, getUsersForSidebar);
router.get('/getlastmessage', protectedRoute, getLastMessage);
router.post('/deleteconversation/:id',protectedRoute,deleteConversation);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessage);

export default router;