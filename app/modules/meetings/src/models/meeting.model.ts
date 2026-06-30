import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IActionItem {
  title: string;
  description: string;
  assignee?: string | null;
  dueDate?: string | null;
  status: "pending" | "in_progress" | "done";
  createdAt: string;
}

export interface IKeyDecision {
  title: string;
  details: string;
}

export interface IMeeting extends Document {
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: "uploading" | "processing" | "completed" | "failed";
  audioUrl?: string | null;
  ticketId?: string | null;
  transcript: string;
  summary: string;
  actionItems: IActionItem[];
  keyDecisions: IKeyDecision[];
  analysisResult?: Record<string, unknown> | null;
  participants: string[];
  meetingDate?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<IActionItem>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignee: { type: String, default: null },
    dueDate: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false },
);

const KeyDecisionSchema = new Schema<IKeyDecision>(
  {
    title: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { _id: false },
);

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    projectId: { type: String, default: "general", index: true },
    projectName: { type: String, default: "General" },
    status: {
      type: String,
      enum: ["uploading", "processing", "completed", "failed"],
      default: "uploading",
    },
    audioUrl: { type: String, default: null },
    ticketId: { type: String, default: null },
    transcript: { type: String, default: "" },
    summary: { type: String, default: "" },
    actionItems: { type: [ActionItemSchema], default: [] },
    keyDecisions: { type: [KeyDecisionSchema], default: [] },
    analysisResult: { type: Schema.Types.Mixed, default: null },
    participants: { type: [String], default: [] },
    meetingDate: { type: String, default: null },
    duration: { type: Number, default: null },
  },
  { timestamps: true },
);

MeetingSchema.index({ createdAt: -1 });

export const MeetingModel: Model<IMeeting> =
  (mongoose.models.Meeting as Model<IMeeting>) ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema);
