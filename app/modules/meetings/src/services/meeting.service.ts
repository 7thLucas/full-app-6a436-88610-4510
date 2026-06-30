import { MeetingModel } from "~/modules/meetings/src/models/meeting.model";
import type { FilterQuery } from "mongoose";
import type { IMeeting } from "~/modules/meetings/src/models/meeting.model";

export interface CreateMeetingInput {
  title: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  meetingDate?: string;
  participants?: string[];
}

export interface UpdateMeetingInput {
  title?: string;
  description?: string;
  projectId?: string;
  projectName?: string;
  meetingDate?: string;
  participants?: string[];
  status?: string;
  audioUrl?: string | null;
  ticketId?: string | null;
  transcript?: string;
  summary?: string;
  actionItems?: Array<{
    title: string;
    description?: string;
    assignee?: string | null;
    dueDate?: string | null;
    status?: string;
    createdAt?: string;
  }>;
  keyDecisions?: Array<{ title: string; details?: string }>;
  analysisResult?: Record<string, unknown>;
  duration?: number;
}

export async function createMeeting(input: CreateMeetingInput) {
  const meeting = await MeetingModel.create({
    title: input.title,
    description: input.description ?? "",
    projectId: input.projectId ?? "general",
    projectName: input.projectName ?? "General",
    meetingDate: input.meetingDate ?? null,
    participants: input.participants ?? [],
    status: "uploading",
  });
  return meeting;
}

export async function getMeetings(
  page = 1,
  limit = 20,
  projectId?: string,
  status?: string,
) {
  const filter: FilterQuery<IMeeting> = {};
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    MeetingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MeetingModel.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getMeetingById(id: string) {
  return MeetingModel.findById(id).lean();
}

export async function updateMeeting(id: string, input: UpdateMeetingInput) {
  return MeetingModel.findByIdAndUpdate(id, { $set: input }, { new: true }).lean();
}

export async function deleteMeeting(id: string) {
  return MeetingModel.findByIdAndDelete(id).lean();
}

export async function updateActionItemStatus(
  meetingId: string,
  actionItemIndex: number,
  status: "pending" | "in_progress" | "done",
) {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) throw new Error("Meeting not found");
  if (!meeting.actionItems[actionItemIndex]) throw new Error("Action item not found");
  meeting.actionItems[actionItemIndex].status = status;
  await meeting.save();
  return meeting;
}

export async function getStats() {
  const [total, completed, processing, totalActionItems, pendingActionItems] = await Promise.all([
    MeetingModel.countDocuments(),
    MeetingModel.countDocuments({ status: "completed" }),
    MeetingModel.countDocuments({ status: "processing" }),
    MeetingModel.aggregate([
      { $project: { count: { $size: "$actionItems" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
    MeetingModel.aggregate([
      { $unwind: "$actionItems" },
      { $match: { "actionItems.status": "pending" } },
      { $count: "total" },
    ]),
  ]);

  return {
    totalMeetings: total,
    completedMeetings: completed,
    processingMeetings: processing,
    totalActionItems: (totalActionItems[0]?.total ?? 0) as number,
    pendingActionItems: (pendingActionItems[0]?.total ?? 0) as number,
  };
}

export async function getProjects() {
  const projects = await MeetingModel.aggregate([
    { $group: { _id: "$projectId", name: { $first: "$projectName" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return projects.map((p) => ({ id: p._id as string, name: p.name as string, meetingCount: p.count as number }));
}
