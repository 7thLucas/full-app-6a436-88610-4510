import type { Request, Response } from "express";
import * as meetingService from "../services/meeting.service";

function ok(res: Response, data: unknown, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function fail(res: Response, message = "Error", status = 500) {
  return res.status(status).json({ success: false, message, data: null });
}

export async function createMeeting(req: Request, res: Response) {
  try {
    const { title, description, projectId, projectName, meetingDate, participants } = req.body;
    if (!title) return fail(res, "Title is required", 400);

    const meeting = await meetingService.createMeeting({
      title,
      description,
      projectId,
      projectName,
      meetingDate,
      participants: Array.isArray(participants) ? participants : [],
    });
    return ok(res, meeting, "Meeting created", 201);
  } catch {
    return fail(res, "Failed to create meeting");
  }
}

export async function getMeetings(req: Request, res: Response) {
  try {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "20"), 10);
    const projectId = req.query.projectId as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await meetingService.getMeetings(page, limit, projectId, status);
    return ok(res, result);
  } catch {
    return fail(res, "Failed to fetch meetings");
  }
}

export async function getMeetingById(req: Request, res: Response) {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    if (!meeting) return fail(res, "Meeting not found", 404);
    return ok(res, meeting);
  } catch {
    return fail(res, "Failed to fetch meeting");
  }
}

export async function updateMeeting(req: Request, res: Response) {
  try {
    const meeting = await meetingService.updateMeeting(req.params.id, req.body);
    if (!meeting) return fail(res, "Meeting not found", 404);
    return ok(res, meeting, "Meeting updated");
  } catch {
    return fail(res, "Failed to update meeting");
  }
}

export async function deleteMeeting(req: Request, res: Response) {
  try {
    const meeting = await meetingService.deleteMeeting(req.params.id);
    if (!meeting) return fail(res, "Meeting not found", 404);
    return ok(res, null, "Meeting deleted");
  } catch {
    return fail(res, "Failed to delete meeting");
  }
}

export async function updateActionItemStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const index = parseInt(req.params.index, 10);
    if (!["pending", "in_progress", "done"].includes(status)) {
      return fail(res, "Invalid status", 400);
    }
    const meeting = await meetingService.updateActionItemStatus(req.params.id, index, status);
    return ok(res, meeting, "Action item updated");
  } catch {
    return fail(res, "Failed to update action item");
  }
}

export async function getStats(_req: Request, res: Response) {
  try {
    const stats = await meetingService.getStats();
    return ok(res, stats);
  } catch {
    return fail(res, "Failed to fetch stats");
  }
}

export async function getProjects(_req: Request, res: Response) {
  try {
    const projects = await meetingService.getProjects();
    return ok(res, projects);
  } catch {
    return fail(res, "Failed to fetch projects");
  }
}
