import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import { getAllMeetings,sendMeetingRequest,getAllMeetingsAdmin,rejectMeetingRequest, acceptMeetingRequest,} from "../controllers/meeting.controller.js";


const router = express.Router();
router.get("/allmeetings/:id", protectedRoute, getAllMeetings);
router.post("/sendmeetingreq", protectedRoute,sendMeetingRequest);
router.post("/confirmmeetings/:id", protectedRoute,acceptMeetingRequest);
router.post("/rejectmeetings/:id", protectedRoute,rejectMeetingRequest);
router.get("/allmeetingsadmin", getAllMeetingsAdmin);

export default router;