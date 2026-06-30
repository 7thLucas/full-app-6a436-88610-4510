import { Router } from "express";
import * as controller from "../controllers/meeting.controller";

const router = Router();

// Stats & projects (before /:id to avoid param collision)
router.get("/api/meetings/stats", controller.getStats);
router.get("/api/meetings/projects", controller.getProjects);

// CRUD
router.get("/api/meetings", controller.getMeetings);
router.post("/api/meetings", controller.createMeeting);
router.get("/api/meetings/:id", controller.getMeetingById);
router.patch("/api/meetings/:id", controller.updateMeeting);
router.delete("/api/meetings/:id", controller.deleteMeeting);

// Action items
router.patch("/api/meetings/:id/action-items/:index/status", controller.updateActionItemStatus);

export default router;
