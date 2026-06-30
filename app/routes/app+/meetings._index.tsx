import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Video, Search, Filter } from "lucide-react";
import { useMeetings } from "~/modules/meetings/hooks/use-meetings";
import { MeetingUploadModal } from "~/modules/meetings/components/meeting-upload-modal";
import { StatusBadge } from "~/modules/meetings/components/status-badge";
import type { Meeting } from "~/modules/meetings/hooks/use-meetings";

const STATUS_OPTIONS = ["all", "completed", "processing", "failed"];

export default function MeetingsListPage() {
  const { meetings, total, loading, fetchMeetings } = useMeetings();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMeetings({
      status: statusFilter === "all" ? undefined : statusFilter,
      limit: 30,
    });
  }, [fetchMeetings, statusFilter]);

  function handleCreated(meeting: Meeting) {
    setShowModal(false);
    fetchMeetings({ limit: 30 });
  }

  const filtered = search
    ? meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.projectName.toLowerCase().includes(search.toLowerCase()),
      )
    : meetings;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Video className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">No meetings found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search" : "Upload your first recording to get started"}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> New Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
              <span>Meeting</span>
              <span className="hidden sm:block">Date</span>
              <span className="hidden md:block">Actions</span>
              <span>Status</span>
            </div>

            {filtered.map((meeting) => (
              <Link
                key={meeting._id}
                to={`/app/meetings/${meeting._id}`}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{meeting.projectName}</p>
                </div>
                <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                  {meeting.meetingDate
                    ? new Date(meeting.meetingDate).toLocaleDateString()
                    : new Date(meeting.createdAt).toLocaleDateString()}
                </span>
                <span className="hidden md:block text-xs text-muted-foreground">
                  {meeting.actionItems.length > 0
                    ? `${meeting.actionItems.length} tasks`
                    : "—"}
                </span>
                <StatusBadge status={meeting.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <MeetingUploadModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
