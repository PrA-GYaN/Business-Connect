import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import { getAllMeetings,sendMeetingRequest,rejectMeetingRequest, acceptMeetingRequest,} from "../controllers/meeting.controller.js";


const router = express.Router();
router.get("/allmeetings", protectedRoute, getAllMeetings);
router.post("/sendmeetingreq", protectedRoute,sendMeetingRequest);
router.post("/confirmmeetings/:id", protectedRoute,acceptMeetingRequest);
router.post("/rejectmeetings/:id", protectedRoute,rejectMeetingRequest);

export default router;