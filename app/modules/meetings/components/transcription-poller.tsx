import { useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle, Mic } from "lucide-react";
import { useTranscriptionResult } from "@qb/audio-analyzer";
import type { Meeting } from "../hooks/use-meetings";

interface TranscriptionPollerProps {
  meeting: Meeting;
  onTranscribed: (transcript: string, segments: unknown[]) => void;
}

export function TranscriptionPoller({ meeting, onTranscribed }: TranscriptionPollerProps) {
  const enabled = Boolean(meeting.ticketId && meeting.status === "processing");

  const { result, isLoading, isCompleted, isFailed, error } = useTranscriptionResult(
    meeting.ticketId ?? "",
    { enabled, pollIntervalMs: 3000 },
  );

  useEffect(() => {
    if (!isCompleted || !result) return;

    // Build transcript text from segments
    const segments = result.analysis?.segments ?? [];
    const transcriptText = segments
      .map((seg) => {
        const speaker = seg.speaker_name ?? seg.speaker_id ?? "Speaker";
        return `[${speaker}]: ${seg.text}`;
      })
      .join("\n");

    if (transcriptText) {
      onTranscribed(transcriptText, segments);
    } else if (result.transcript_path) {
      // Transcript available but no inline segments — use summary
      const summary = result.analysis?.summary ?? "";
      onTranscribed(summary, []);
    }
  }, [isCompleted, result, onTranscribed]);

  if (!enabled) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isCompleted ? "bg-primary/10" : isFailed ? "bg-destructive/10" : "bg-accent/10"}`}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-primary" />
          ) : isFailed ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : (
            <Mic className="w-4 h-4 text-accent" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isLoading && (
            <>
              <p className="text-sm font-medium text-foreground">Starting transcription...</p>
              <p className="text-xs text-muted-foreground">Connecting to AI service</p>
            </>
          )}
          {!isLoading && !isCompleted && !isFailed && result && (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground capitalize">
                  {result.stage ?? result.status ?? "Processing"}
                </p>
                <Loader2 className="w-3 h-3 text-accent animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">AI is transcribing your recording</p>
            </>
          )}
          {isCompleted && (
            <>
              <p className="text-sm font-medium text-primary">Transcription complete</p>
              <p className="text-xs text-muted-foreground">Ready for AI analysis</p>
            </>
          )}
          {isFailed && (
            <>
              <p className="text-sm font-medium text-destructive">Transcription failed</p>
              <p className="text-xs text-muted-foreground">{error ?? "An error occurred"}</p>
            </>
          )}
        </div>
      </div>

      {/* Progress log */}
      {result?.logs && result.logs.length > 0 && !isCompleted && !isFailed && (
        <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
          {result.logs.slice(-4).map((log, i) => (
            <p key={i} className="text-xs text-muted-foreground font-mono">
              {log.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
