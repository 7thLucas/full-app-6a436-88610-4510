import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useMeetingDetail } from "~/modules/meetings/hooks/use-meetings";
import { StatusBadge } from "~/modules/meetings/components/status-badge";
import { TranscriptionPoller } from "~/modules/meetings/components/transcription-poller";
import { MeetingAIProcessor } from "~/modules/meetings/components/meeting-ai-processor";
import type { Meeting } from "~/modules/meetings/hooks/use-meetings";

const ACTION_STATUSES = ["pending", "in_progress", "done"] as const;
type ActionStatus = (typeof ACTION_STATUSES)[number];

function ActionStatusCycle({ status, onChange }: { status: ActionStatus; onChange: (s: ActionStatus) => void }) {
  const next: Record<ActionStatus, ActionStatus> = {
    pending: "in_progress",
    in_progress: "done",
    done: "pending",
  };
  const colorMap: Record<ActionStatus, string> = {
    pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    in_progress: "text-accent border-accent/30 bg-accent/10",
    done: "text-primary border-primary/30 bg-primary/10",
  };
  const label: Record<ActionStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    done: "Done",
  };

  return (
    <button
      onClick={() => onChange(next[status])}
      className={`text-xs font-medium px-2 py-0.5 rounded border transition-colors ${colorMap[status]}`}
    >
      {label[status]}
    </button>
  );
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { meeting, setMeeting, loading, error, fetchMeeting } = useMeetingDetail(id!);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const handleTranscribed = useCallback(
    async (transcript: string) => {
      if (!meeting) return;
      await fetch(`/api/meetings/${meeting._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, status: "processing" }),
      });
      setMeeting((prev) => prev ? { ...prev, transcript, status: "processing" } : prev);
    },
    [meeting, setMeeting],
  );

  const handleAIProcessed = useCallback(
    (updates: Partial<Meeting>) => {
      setMeeting((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [setMeeting],
  );

  const handleActionStatusChange = useCallback(
    async (index: number, status: ActionStatus) => {
      if (!meeting) return;
      setUpdatingIndex(index);
      try {
        await fetch(`/api/meetings/${meeting._id}/action-items/${index}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        setMeeting((prev) => {
          if (!prev) return prev;
          const items = [...prev.actionItems];
          items[index] = { ...items[index], status };
          return { ...prev, actionItems: items };
        });
      } finally {
        setUpdatingIndex(null);
      }
    },
    [meeting, setMeeting],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-destructive">{error ?? "Meeting not found"}</p>
        <Link to="/app/meetings" className="text-xs text-primary mt-2 inline-block">
          Back to meetings
        </Link>
      </div>
    );
  }

  const pendingCount = meeting.actionItems.filter((a) => a.status === "pending").length;
  const doneCount = meeting.actionItems.filter((a) => a.status === "done").length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          to="/app/meetings"
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{meeting.title}</h1>
            <StatusBadge status={meeting.status} />
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {meeting.projectName}
            </span>
            {meeting.meetingDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(meeting.meetingDate).toLocaleDateString()}
              </span>
            )}
            {meeting.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(meeting.duration / 60)} min
              </span>
            )}
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meeting.participants.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transcription poller (shows when processing) */}
      {meeting.ticketId && meeting.status === "processing" && (
        <TranscriptionPoller meeting={meeting} onTranscribed={handleTranscribed} />
      )}

      {/* AI processor (shows when transcript available) */}
      {meeting.transcript && (
        <MeetingAIProcessor meeting={meeting} onProcessed={handleAIProcessed} />
      )}

      {/* Summary */}
      {meeting.summary && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Meeting Summary
          </h2>
          <p className="text-sm text-foreground leading-relaxed">{meeting.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Action Items */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Action Items</h2>
              {meeting.actionItems.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {doneCount}/{meeting.actionItems.length}
                </span>
              )}
            </div>
            {pendingCount > 0 && (
              <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                {pendingCount} pending
              </span>
            )}
          </div>

          {meeting.actionItems.length === 0 ? (
            <div className="py-8 text-center">
              <CheckSquare className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {meeting.transcript
                  ? "Run AI analysis to extract action items"
                  : "Upload and transcribe to get action items"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {meeting.actionItems.map((item, index) => (
                <div
                  key={index}
                  className={`px-5 py-3.5 transition-opacity ${updatingIndex === index ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <ActionStatusCycle
                      status={item.status as ActionStatus}
                      onChange={(s) => handleActionStatusChange(index, s)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {item.assignee && (
                          <span className="text-xs text-muted-foreground">
                            <Users className="w-3 h-3 inline mr-1" />
                            {item.assignee}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Decisions */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <FileText className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Key Decisions</h2>
          </div>

          {meeting.keyDecisions.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {meeting.transcript
                  ? "Run AI analysis to extract decisions"
                  : "Transcript needed to extract decisions"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {meeting.keyDecisions.map((decision, index) => (
                <div key={index} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-foreground">{decision.title}</p>
                  {decision.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{decision.details}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transcript */}
      {meeting.transcript && (
        <div className="bg-card border border-border rounded-lg">
          <button
            onClick={() => setTranscriptOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Transcript</h2>
            </div>
            {transcriptOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {transcriptOpen && (
            <div className="px-5 pb-5 border-t border-border">
              <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono mt-4 max-h-64 overflow-y-auto">
                {meeting.transcript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
