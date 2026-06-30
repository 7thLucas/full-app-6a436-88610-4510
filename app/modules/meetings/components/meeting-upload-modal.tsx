import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { useTranscribe } from "@qb/audio-analyzer";
import type { Meeting } from "../hooks/use-meetings";

interface MeetingUploadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (meeting: Meeting) => void;
}

export function MeetingUploadModal({ open, onClose, onCreated }: MeetingUploadModalProps) {
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("General");
  const [projectId, setProjectId] = useState("general");
  const [meetingDate, setMeetingDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { submit: submitTranscription, isSubmitting } = useTranscribe();
  // submitTranscription: (input: SubmitTranscriptionInput) => Promise<TranscribeResult>

  if (!open) return null;

  function handleFileSelect(f: File) {
    if (!f.type.startsWith("audio/") && !f.type.startsWith("video/")) {
      setError("Only audio or video files are supported.");
      return;
    }
    setFile(f);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Meeting title is required."); return; }
    if (!file) { setError("Please select an audio or video file."); return; }
    setError(null);
    setStep("processing");

    try {
      // 1. Create meeting record
      const createRes = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          projectId: projectId || "general",
          projectName: projectName || "General",
          meetingDate: meetingDate || null,
          status: "processing",
        }),
      });
      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.message);
      const meetingId: string = createJson.data._id;

      // 2. Submit to audio-analyzer for transcription
      let ticketId: string | null = null;
      try {
        const result = await submitTranscription({ files: [file] });
        ticketId = result?.ticket_id ?? null;
      } catch {
        // Non-fatal — meeting still created, transcription pending
      }

      // 3. Patch meeting with ticketId
      if (ticketId) {
        await fetch(`/api/meetings/${meetingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId, status: "processing" }),
        });
      }

      // Return created meeting
      const meetingRes = await fetch(`/api/meetings/${meetingId}`);
      const meetingJson = await meetingRes.json();
      if (meetingJson.success) {
        onCreated(meetingJson.data);
      }

      // Reset form
      setTitle("");
      setProjectName("General");
      setProjectId("general");
      setMeetingDate("");
      setFile(null);
      setStep("form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
      setStep("form");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">New Meeting</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "processing" ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Creating meeting &amp; uploading recording...</p>
            <p className="text-xs text-muted-foreground text-center">
              This may take a moment. AI processing will continue in the background.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Meeting Title <span className="text-destructive">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Planning Session"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Project */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project Name</label>
                <input
                  value={projectName}
                  onChange={(e) => { setProjectName(e.target.value); setProjectId(e.target.value.toLowerCase().replace(/\s+/g, "-")); }}
                  placeholder="e.g. Product Team"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Recording File <span className="text-destructive">*</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileSelect(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? "text-primary" : "text-muted-foreground"}`} />
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-foreground font-medium">Drop audio/video file here</p>
                    <p className="text-xs text-muted-foreground mt-0.5">or click to browse • MP3, MP4, WAV, M4A, WebM</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create & Process"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
