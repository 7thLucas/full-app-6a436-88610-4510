import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { invokeLLM } from "@qb/agentic";
import type { Meeting } from "../hooks/use-meetings";

interface MeetingAIProcessorProps {
  meeting: Meeting;
  onProcessed: (updates: Partial<Meeting>) => void;
}

const MEETING_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "A concise 2-4 sentence summary of the meeting",
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          assignee: { type: "string" },
          dueDate: { type: "string", description: "ISO date string or null" },
          status: { type: "string", enum: ["pending", "in_progress", "done"] },
        },
        required: ["title", "status"],
      },
    },
    keyDecisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          details: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  required: ["summary", "actionItems", "keyDecisions"],
};

type ProcessState = "idle" | "processing" | "done" | "error";

export function MeetingAIProcessor({ meeting, onProcessed }: MeetingAIProcessorProps) {
  const [state, setState] = useState<ProcessState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasTranscript = Boolean(meeting.transcript && meeting.transcript.trim().length > 0);
  const alreadyProcessed =
    meeting.actionItems.length > 0 || meeting.keyDecisions.length > 0 || Boolean(meeting.summary);

  async function processWithAI() {
    if (!hasTranscript) return;
    setState("processing");
    setErrorMsg(null);

    try {
      const result = await invokeLLM({
        message: `Analyze this meeting transcript and extract structured information:\n\n---\n${meeting.transcript}\n---`,
        systemPrompt:
          "You are an expert meeting analyst. Extract action items with clear owners and deadlines, key decisions made, and write a concise summary. Return ONLY valid JSON matching the schema. For dates, use ISO format (YYYY-MM-DD) or null.",
        schema: MEETING_SCHEMA,
      });

      if (result.status === "ERROR" || !result.response) {
        throw new Error(result.error ?? "AI processing failed");
      }

      const data = result.response as {
        summary?: string;
        actionItems?: Array<{ title: string; description?: string; assignee?: string; dueDate?: string; status: string }>;
        keyDecisions?: Array<{ title: string; details?: string }>;
      };

      const updates: Partial<Meeting> = {
        summary: data.summary ?? "",
        actionItems: (data.actionItems ?? []).map((ai) => ({
          title: ai.title,
          description: ai.description ?? "",
          assignee: ai.assignee ?? null,
          dueDate: ai.dueDate ?? null,
          status: (ai.status as "pending" | "in_progress" | "done") || "pending",
          createdAt: new Date().toISOString(),
        })),
        keyDecisions: (data.keyDecisions ?? []).map((kd) => ({
          title: kd.title,
          details: kd.details ?? "",
        })),
        status: "completed",
      };

      // Persist to DB
      await fetch(`/api/meetings/${meeting._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      onProcessed(updates);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Processing failed");
      setState("error");
    }
  }

  if (!hasTranscript) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Meeting Analysis</p>
            <p className="text-xs text-muted-foreground">
              {alreadyProcessed
                ? "Re-run AI to regenerate action items, decisions & summary"
                : "Extract action items, key decisions & summary from transcript"}
            </p>
          </div>
        </div>

        {state === "idle" || state === "error" ? (
          <button
            onClick={processWithAI}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {alreadyProcessed ? "Re-analyze" : "Analyze Now"}
          </button>
        ) : state === "processing" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-primary">
            <CheckCircle className="w-4 h-4" />
            Done
          </div>
        )}
      </div>

      {state === "error" && errorMsg && (
        <div className="mt-3 flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
